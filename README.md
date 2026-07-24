# NeverQuit — Ziua 2

## REALIZAT

- misiunile și soldul Spark se salvează automat în browser;
- la începutul unei zile noi, misiunile se resetează, dar soldul rămâne;
- recompensele sunt trimise ca cereri;
- Spark-urile cererilor în așteptare sunt rezervate, ca să nu fie cheltuite de două ori;
- părintele poate crea un PIN din 4 cifre;
- părintele poate aproba sau respinge cererile;
- Spark-urile se scad numai după aprobare;
- recompensa „1 oră PS” poate fi cerută maximum o dată pe zi;
- există istoric pentru cereri.

## Cum testezi

1. Deschide `index.html` în Chrome.
2. Bifează misiuni până ai cel puțin 60 Spark.
3. Cere recompensa „1 oră PS”.
4. Deschide „Zonă părinte”.
5. La prima folosire, creează un PIN din 4 cifre.
6. Aprobă recompensa.
7. Închide pagina și redeschide-o: soldul și istoricul trebuie să rămână.

## Observație

PIN-ul este salvat local și este potrivit pentru un prototip de familie. Nu este o măsură de securitate avansată.

## Următoarea sesiune propusă

- raport pe zile;
- numărul de misiuni începute fără reamintire;
- buton separat pentru marcarea „Am început singur”.
