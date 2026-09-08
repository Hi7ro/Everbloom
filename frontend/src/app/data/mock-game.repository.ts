import { Injectable } from '@angular/core';
import { ActivityCommand } from '../domain/models';
import { recordActivity } from '../domain/progression';
import { GameRepository } from './game.repository';
import { createMockSnapshot } from './mock-data';

@Injectable()
export class MockGameRepository implements GameRepository {
  private snapshot = createMockSnapshot();
  async load() {
    return structuredClone(this.snapshot);
  }
  async record(command: ActivityCommand) {
    const result = recordActivity(this.snapshot, command);
    this.snapshot = result.snapshot;
    return structuredClone(result);
  }
  async resetDemo() {
    this.snapshot = createMockSnapshot();
    return this.load();
  }
}
