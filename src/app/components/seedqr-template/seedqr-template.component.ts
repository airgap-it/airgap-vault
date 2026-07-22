import { Component } from '@angular/core';
import { SeedqrTemplateService } from '../../services/seedqr-template.service';

@Component({
  selector: 'app-seedqr-template',
  templateUrl: './seedqr-template.component.html',
  styleUrls: ['./seedqr-template.component.scss']
})
export class SeedqrTemplateComponent {

  // teste inicial: SeedQR 29x29
  readonly qrSize = 29;

  zoneX = 0;
  zoneY = 0; 
  // Sonar: matrix is intentionally mutable because the QR template is rebuilt dynamically
  readonly matrix: number[][] = [];

  constructor(
   private readonly seedqrTemplateService: SeedqrTemplateService
  ) {}


  get zoneLabel(): string {

    return this.seedqrTemplateService.getZoneLabel(
      this.zoneX,
      this.zoneY
    );

  }


  get zoneCount(): number {

    return this.seedqrTemplateService.getZoneCount(
      this.qrSize
    );

  }


  nextZone() {

    if (this.zoneX + 1 < this.zoneCount) {
      this.zoneX++;
    }

  }


  previousZone() {

    if (this.zoneX > 0) {
      this.zoneX--;
    }

  }

    createTestMatrix() {

    for (let y = 0; y < this.qrSize; y++) {

      const row: number[] = [];

      for (let x = 0; x < this.qrSize; x++) {

        row.push((x + y) % 2);

      }

      this.matrix.push(row);

    }

  }

  get currentZone() {

  return this.seedqrTemplateService.getZonePosition(
    this.zoneX,
    this.zoneY,
    this.qrSize
  );

}


}