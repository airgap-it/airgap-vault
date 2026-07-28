import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeedqrTemplateService {

  constructor() {}

  getModulesPerZone(numModules: number): number {

    if (numModules === 21) {
      return 7;
    }

    return 5;
  }


  getZoneCount(numModules: number): number {

    const modulesPerZone = this.getModulesPerZone(numModules);

    return Math.ceil(numModules / modulesPerZone);
  }


  getZoneLabel(zoneX: number, zoneY: number): string {

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  if (zoneY < 0 || zoneY >= letters.length) {
    return '';
  }

  return letters[zoneY] + (zoneX + 1);
}

  getZonePosition(zoneX: number, zoneY: number, numModules: number) {

    const modulesPerZone = this.getModulesPerZone(numModules);

    return {
      startX: zoneX * modulesPerZone,
      startY: zoneY * modulesPerZone,
      endX: Math.min(
        (zoneX + 1) * modulesPerZone,
        numModules
      ),
      endY: Math.min(
        (zoneY + 1) * modulesPerZone,
        numModules
      )
    };
  }

}
