import * as React from 'react';
import { App, PluginSettingTab } from 'obsidian';
import FileOrganizer from '../../index';
import { createRoot, Root } from 'react-dom/client';
import { SettingsTabContent } from './main';
import { logMessage } from '../../someUtils';
import {
  getNoteCompanionSettingDefinitions,
  type NoteCompanionSettingDefinition,
} from './setting-definitions';

export class FileOrganizerSettingTab extends PluginSettingTab {
  plugin: FileOrganizer;
  private root: Root | null = null;

  constructor(app: App, plugin: FileOrganizer) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Obsidian 1.13+ declarative settings for global search indexing.
   * On 1.13+, Obsidian renders from these definitions instead of display().
   * display() remains for Obsidian versions before 1.13 (minAppVersion 1.8.7).
   */
  getSettingDefinitions(): NoteCompanionSettingDefinition[] {
    return getNoteCompanionSettingDefinitions(this.plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('fo2k-view');

    if (!this.root) {
      this.root = createRoot(containerEl);
    }

    this.root.render(
      <React.StrictMode>
          <SettingsTabContent plugin={this.plugin} />
      </React.StrictMode>
    );
  }

  hide(): void {
    logMessage("hide");
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.containerEl.removeClass('fo2k-view');
  }
}

