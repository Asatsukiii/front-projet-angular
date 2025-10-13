import { Component, OnInit } from '@angular/core';
import { CasePlateauService } from '../../services/case-plateau.service';
import { CasePlateau } from '../../models/case-plateau.model';
import { find } from "rxjs"

@Component({
  selector: 'app-plateau',
  templateUrl: './plateau.component.html',
  styleUrls: ['./plateau.component.scss']
})
export class PlateauComponent implements OnInit {
  cases: CasePlateau[] = [];
  lignes: CasePlateau[][] = [];
  casesAffichees: CasePlateau[] = [];
  showRules = false;

  constructor(private caseService: CasePlateauService) {}

  ngOnInit(): void {
    this.caseService.getAll().subscribe({
      next: (data) => {
        this.cases = data;
        this.lignes = this.generateGrille(data);
        this.casesAffichees = this.lignes.flat();
      },
      error: (err) => console.error('Erreur chargement plateau:', err)
    });
  }



 generateGrille(cases: CasePlateau[]): CasePlateau[][] {


    const lignes: CasePlateau[][] = [];
    const find = (couleur: string, position: number) =>
      cases.find(c => c.couleur === couleur && c.position === position)!;

   // ligne 1
   lignes.push([
     ...Array(6).fill(find('JAUNE', 15)),
     find('JAUNE', 13),
     find('BLEU', 14 ),
     find('BLEU', 1),
     ...Array(6).fill(find('BLEU', 15))
   ]);

    //ligne 2 à 6

   var jaunePosition: number= 12;
   var bleuPosition1: number= 16;
   var bleuPosition2: number= 2;

    for (let i = 1; i <= 5; i++) {

      lignes.push([
        ...Array(6).fill(find('JAUNE', 15)),
        find('JAUNE', jaunePosition),
        find('BLEU', bleuPosition1),
        find('BLEU', bleuPosition2),
        ...Array(6).fill(find('BLEU', 15))
      ]);
      jaunePosition--;
      bleuPosition1++;
      bleuPosition2++;
    }


    // ligne 7
   lignes.push([
     ...Array.from({ length: 7 }, (_, i) => find('JAUNE', i + 1)),
     find('BLEU', 21),
     ...Array.from({ length: 7 }, (_, i) => find('BLEU', i + 7))
   ]);

    //ligne 8
    lignes.push([
      find('JAUNE', 14),
      ...Array.from({ length: 6 }, (_, i) => find('JAUNE', i + 16 )),
      find('BLEU', 85),
      ...Array.from({ length: 6 }, (_, i) => find('ROUGE', 21-i)),
      find('ROUGE', 14),
    ]);

    // ligne 9
   lignes.push([
     ...Array.from({ length: 7 }, (_, i) => find('VERT', 13-i)),
     find('VERT', 21),
     ...Array.from({ length: 7 }, (_, i) => find('ROUGE', 7-i))
   ]);

    // ligne 10 à 14
   var vertPosition1: number= 6;
   var vertPosition2: number= 20;
   var rougePosition: number= 8
   ;
   for (let i = 1; i <= 5; i++) {

     lignes.push([
       ...Array(6).fill(find('VERT', 15)),
       find('VERT', vertPosition1),
       find('VERT', vertPosition2),
       find('ROUGE', rougePosition),
       ...Array(6).fill(find('ROUGE', 15))
     ]);
     vertPosition1--;
     vertPosition2--;
     rougePosition++;
   }

    // ligne 15
   lignes.push([
     ...Array(6).fill(find('VERT', 15)),
     find('VERT', 1),
     find('VERT', 14 ),
     find('ROUGE', 13),
     ...Array(6).fill(find('ROUGE', 15))
   ]);

    return lignes;
  }


  toggleRules() {
    this.showRules = !this.showRules;
  }
}
