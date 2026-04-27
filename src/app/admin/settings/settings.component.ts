import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  activeTab: 'hostel' | 'rooms' | 'mess' | 'system' = 'hostel';
  hasChanges = false;
  private originalSettings: any = null;

  ngOnInit() {
    this.settingsService.loadSettings();
    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
  }

  get settings() {
    return this.settingsService.getSettings()();
  }

  markAsChanged() {
    this.hasChanges = true;
  }

  async saveSettings() {
    try {
      await this.settingsService.saveSettings();
      this.hasChanges = false;
      this.originalSettings = JSON.parse(JSON.stringify(this.settings));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    }
  }

  addDietaryOption() {
    const current = this.settings.dietaryOptions;
    this.settingsService.updateDietaryOptions([...current, '']);
    this.markAsChanged();
  }

  removeDietaryOption(index: number) {
    const current = this.settings.dietaryOptions;
    const updated = current.filter((_: any, i: number) => i !== index);
    this.settingsService.updateDietaryOptions(updated);
    this.markAsChanged();
  }
}
