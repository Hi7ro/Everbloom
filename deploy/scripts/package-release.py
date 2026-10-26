#!/usr/bin/env python3
"""Create a local source deployment archive; never uploads or includes local configuration."""

import argparse
import fnmatch
import hashlib
import io
import json
import os
from pathlib import Path
import tarfile

ROOT = Path(__file__).resolve().parents[2]
FILES = (
    'frontend/package.json', 'frontend/package-lock.json', 'frontend/angular.json',
    'frontend/tsconfig.json', 'frontend/tsconfig.app.json', 'frontend/tsconfig.spec.json',
    'backend/pom.xml', 'deploy/compose.yml', 'deploy/Caddyfile', 'deploy/.env.example',
    'deploy/frontend.Dockerfile', 'deploy/frontend.Dockerfile.dockerignore',
    'deploy/backend.Dockerfile', 'deploy/backend.Dockerfile.dockerignore',
)
TREES = ('frontend/src', 'frontend/public', 'backend/src', 'deploy/postgres', 'deploy/scripts')
SUFFIXES = {
    '.ts', '.html', '.scss', '.css', '.svg', '.json', '.png', '.webp', '.jpg', '.jpeg',
    '.ico', '.wav', '.mp3', '.ogg', '.woff', '.woff2', '.ttf', '.java', '.sql', '.yml',
    '.yaml', '.properties', '.xml', '.csv', '.txt', '.sh', '.py',
}
PRIVATE_PARTS = {'.git', '.local', '.DS_Store', 'node_modules', 'dist', '.angular', '__pycache__', 'coverage'}


def has_link(root, source):
    current = root
    for part in source.relative_to(root).parts:
        current = current / part
        if current.is_symlink():
            return True
    return False


def source_files(root):
    selected = []
    if has_link(root, root / 'frontend/angular.json'):
        raise ValueError('Unsafe Angular configuration path')
    angular = json.loads((root / 'frontend/angular.json').read_text())
    ignored_art = angular['projects']['everbloom']['architect']['build']['options']['assets'][0].get('ignore', [])
    for relative in FILES:
        source = root / relative
        if has_link(root, source) or not source.is_file():
            raise ValueError(f'Missing or unsafe required source: {relative}')
        selected.append(source)
    for relative in TREES:
        directory = root / relative
        if has_link(root, directory) or not directory.is_dir():
            raise ValueError(f'Missing or unsafe source directory: {relative}')
        for source in sorted(directory.rglob('*')):
            if source.is_symlink():
                raise ValueError(f'Symlink refused: {source.relative_to(root)}')
            parts = source.relative_to(root).parts
            if any(part in PRIVATE_PARTS or part.startswith('.env') for part in parts):
                continue
            if source.is_dir():
                continue
            if not source.is_file() or source.suffix.lower() not in SUFFIXES:
                raise ValueError(f'Unexpected source type; review before packaging: {source.relative_to(root)}')
            if relative == 'frontend/public':
                asset = source.relative_to(directory).as_posix()
                if any(fnmatch.fnmatchcase(asset, pattern) for pattern in ignored_art):
                    continue
            selected.append(source)
    return sorted(set(selected))


def package(root, output):
    root = Path(root).resolve()
    output = Path(output).absolute()
    sources = source_files(root)
    # No overwrite, including symlinks. Permissions are restrictive from initial creation.
    fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    manifest = {'format': 1, 'kind': 'source-deployment-only', 'files': []}
    try:
        with os.fdopen(fd, 'wb') as destination, tarfile.open(fileobj=destination, mode='w:gz') as archive:
            for source in sources:
                relative = source.relative_to(root).as_posix()
                # Refuse source links again just before reading; no external files are followed.
                with os.fdopen(os.open(source, os.O_RDONLY | os.O_NOFOLLOW), 'rb') as stream:
                    contents = stream.read()
                entry = tarfile.TarInfo('herovera-release/' + relative)
                entry.size = len(contents)
                entry.mode = 0o755 if source.suffix == '.sh' else 0o644
                archive.addfile(entry, io.BytesIO(contents))
                manifest['files'].append({
                    'path': relative, 'bytes': len(contents),
                    'sha256': hashlib.sha256(contents).hexdigest(),
                })
            contents = (json.dumps(manifest, indent=2) + '\n').encode()
            entry = tarfile.TarInfo('herovera-release/RELEASE_MANIFEST.json')
            entry.size = len(contents)
            entry.mode = 0o644
            archive.addfile(entry, io.BytesIO(contents))
    except BaseException:
        output.unlink(missing_ok=True)
        raise
    return len(sources)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path, help='New .tar.gz file; existing files are never replaced.')
    args = parser.parse_args()
    try:
        count = package(ROOT, args.output)
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, f'Packaging stopped: {error}\n')
    print(f'Local deployment archive created: {args.output} ({count} source files).')
    print('No upload. Create deploy/.env separately on the server; review source code before external transfer.')


if __name__ == '__main__':
    main()
