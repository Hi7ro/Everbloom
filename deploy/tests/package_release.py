#!/usr/bin/env python3
"""Isolated safety tests for source packaging; no network or deployment."""
import hashlib
import importlib.util
import json
from pathlib import Path
import stat
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('package_release', Path(__file__).parents[1] / 'scripts/package-release.py')
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)


class ReleasePackageTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'repo'
        self.output = Path(self.temp.name) / 'release.tar.gz'
        for relative in packager.FILES:
            self.put(relative, '{}')
        for relative in packager.TREES:
            (self.root / relative).mkdir(parents=True, exist_ok=True)
        self.put('frontend/angular.json', json.dumps({'projects': {'everbloom': {'architect': {
            'build': {'options': {'assets': [{'ignore': ['art/*-original.png']}]}}
        }}}}))
        self.put('frontend/src/new-page.ts', 'new untracked source')
        self.put('frontend/public/art/character.webp', 'runtime artwork')
        self.put('frontend/public/art/character-original.png', 'unused source artwork')

    def put(self, relative, data):
        file = self.root / relative
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(data)
        return file

    def test_allowlist_excludes_private_runtime_and_native_files(self):
        for path in ('.local/account.json', '.env', 'deploy/.env', 'frontend/.env',
                     'frontend/src/.env.local', 'frontend/src/.DS_Store', 'frontend/node_modules/key.json',
                     'frontend/android/upload.jks', 'backend/target/app.jar'):
            self.put(path, 'SECRET_SENTINEL')
        packager.package(self.root, self.output)
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o600)
        with tarfile.open(self.output) as archive:
            names = archive.getnames()
            self.assertIn('herovera-release/frontend/src/new-page.ts', names)
            self.assertIn('herovera-release/frontend/public/art/character.webp', names)
            self.assertNotIn('herovera-release/frontend/public/art/character-original.png', names)
            for entry in archive:
                self.assertNotIn(b'SECRET_SENTINEL', archive.extractfile(entry).read())

    def test_manifest_matches_actual_file_bytes_and_safe_names(self):
        packager.package(self.root, self.output)
        with tarfile.open(self.output) as archive:
            manifest = json.load(archive.extractfile('herovera-release/RELEASE_MANIFEST.json'))
            self.assertEqual(len(manifest['files']), len(archive.getmembers()) - 1)
            for entry in manifest['files']:
                self.assertNotIn('..', Path(entry['path']).parts)
                data = archive.extractfile('herovera-release/' + entry['path']).read()
                self.assertEqual(len(data), entry['bytes'])
                self.assertEqual(hashlib.sha256(data).hexdigest(), entry['sha256'])

    def test_existing_output_is_preserved(self):
        self.output.write_bytes(b'previous archive')
        with self.assertRaises(FileExistsError):
            packager.package(self.root, self.output)
        self.assertEqual(self.output.read_bytes(), b'previous archive')

    def test_source_symlink_is_refused_before_archive_creation(self):
        secret = Path(self.temp.name) / 'private.json'
        secret.write_text('not for deployment')
        (self.root / 'frontend/src/link.json').symlink_to(secret)
        with self.assertRaisesRegex(ValueError, 'Symlink refused'):
            packager.package(self.root, self.output)
        self.assertFalse(self.output.exists())

    def test_unexpected_key_file_in_source_stops_packaging(self):
        self.put('frontend/src/private.pem', 'private key')
        with self.assertRaisesRegex(ValueError, 'Unexpected source type'):
            packager.package(self.root, self.output)
        self.assertFalse(self.output.exists())

    def test_parent_directory_symlink_is_refused(self):
        backend = self.root / 'backend'
        destination = Path(self.temp.name) / 'external-backend'
        backend.rename(destination)
        backend.symlink_to(destination, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'Missing or unsafe'):
            packager.package(self.root, self.output)
        self.assertFalse(self.output.exists())

    def test_missing_build_input_fails_instead_of_incomplete_archive(self):
        (self.root / 'backend/pom.xml').unlink()
        with self.assertRaisesRegex(ValueError, 'Missing or unsafe'):
            packager.package(self.root, self.output)
        self.assertFalse(self.output.exists())


if __name__ == '__main__':
    unittest.main(verbosity=2)
