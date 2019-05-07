var letters = [ '', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','U' ]; //używane do stworzenia legendy
var whoShoots = 0; //tura gracza czy komputera
var N = 10;	//ilość pól N*N

var miss = new Audio("./sound/miss.mp3");
miss.loop = false;
miss.autoplay = false;

var hit = new Audio("./sound/hit.mp3");
hit.loop = false;
hit.autoplay = false;

//pola dla sztucznej inteligencji
var lastDirection = -1;
var aiDirections = [ 0, 1, 2, 3 ];
var lastShotShipId = -1; //id ostatniego trafionego pola przez komputer
var firstShotShipId = -1;//id pierwszego trafionego pola przez komputer w celach zawracania ostrzału
var twoGoodShotsSameDirection = -1; //w celach zawracania ostrzału bez strzelenia po bokach

function createTableFields( table, ID ) { //tworzy tabelę pól w htmlu
    //legenda
    var tr = document.createElement( "TR" );
    table.appendChild( tr );

    for( var i = 0 ; i <= N ; i++ ) {
        var elem = document.createElement( "TH" );
        elem.appendChild( document.createTextNode( letters[ i ] ) );
        tr.appendChild( elem );
    }

    //pola do gry
    for( var i = 1 ; i <= N ; i++ ) {
        //tworzymy nowy wiersz
        tr = document.createElement( "TR" );
        table.appendChild( tr );

        //po lewej legenda z numerami pól
        var elem = document.createElement( "TH" );
        elem.appendChild( document.createTextNode( i ) );
        tr.appendChild( elem );

        //tworzymy pola w tabeli
        for( var j = 1 ; j <= N ; j++ ) {
            elem = document.createElement( "TD" );
            elem.id = ID + (((i-1)*10) +(j-1));
            elem.className = 'v0';
            tr.appendChild( elem );
        }
    }
}

var shootShip = function() { //strzelanie do pól komputera
    var id = this.id.charAt(2);
    id += this.id.charAt(3);

    if( whoShoots == 0 ) { //jeżeli tura gracza
        if( r_shipTable[ id ] == 0 ) { //jeżeli pudło
            toConsole( '<span style="color:green">Gracz: </span>' + letters[(id%10)+1] + Math.floor((id/10)+1) + '<span style="color:#5eefff"> pudło!</span>' );
            this.className = 'v1';
            this.innerHTML = 'X';
            this.removeEventListener('click', shootShip, false ); //po naciśnięciu pola, usuwamy funkcję z tego pola
            whoShoots = 1;
            miss.currentTime = 0;
            miss.play();
            setTimeout(aiRandomShoot, 750);
        }
        else { //jezeli trafiony
            toConsole( '<span style="color:green">Gracz: </span>' + letters[(id%10)+1] + Math.floor((id/10)+1) + '<span style="color:yellow"> statek trafiony!</span>' );

            var oldId = r_shipTable[ id ];
            r_shipTable[ id ] = 0;
            if(checkIfSunk(r_shipTable, oldId) == true){
                toConsole( '<span style="color:green">Gracz: </span><span style="color:purple">STATEK TYPU <span style="color:orange">' + typeOfShip(oldId) + '</span><span style="color:purple"> ZOSTAŁ ZATOPIONY!</span>' );
            }

            this.className = 'v3';
            this.removeEventListener('click', shootShip, false );
            whoShoots = 0;
            hit.currentTime = 0;
            hit.play();
        }
    }
    if( checkTable(r_shipTable) ) {
        toConsole( "<h1>WYGRAŁEŚ!</h1>" );
        removeOnMouseClick( document.getElementById( 'table2' ), 'R_', shootShip );
    }
}

function aiRandomShoot() { //strzelanie do pól gracza
    var elem;
    if( checkTable(l_shipTable) ) {
        toConsole( "<h1>PRZEGRAŁEŚ! :(</h1>" );
        removeOnMouseClick( document.getElementById( 'table2' ), 'R_', shootShip );
        return 0;
    }
    if( whoShoots == 1 ) { //jeżeli tura komputera
        if( lastShotShipId == -1 ) { //strzelanie losowo
            elem = document.getElementById(shootCoordinates());
        }
        else { //strzelanie ai
            var elem1 = ai();
            while( elem1 == -1 ) {
                elem1 = ai();
            }
            elem = document.getElementById(elem1);
        }

        if( elem != null ) { //jeżeli return z tablicy coordinates nie jest pusty
            if( elem.className == 'v0' ) { //jeżeli pudło
                var id = elem.id.charAt(2);
                id += elem.id.charAt(3);
                toConsole( '<span style="color:red">Komputer: </span>' + letters[(id%10)+1] + Math.floor((id/10)+1) + '<span style="color:#5eefff"> pudło!</span>' );
                elem.innerHTML = 'X';
                elem.className = 'v1';
                miss.play();
                miss.currentTime = 0;
                if( twoGoodShotsSameDirection != -1 ) { //zawracanie ostrzału po 2 udanych i 1 nieudanym strzale w tym samym kierunku
                    if( twoGoodShotsSameDirection == 0 ) {
                        lastDirection = 2;
                        lastShotShipId = firstShotShipId;
                    }
                    if( twoGoodShotsSameDirection == 1 ) {
                        lastDirection = 3;
                        lastShotShipId = firstShotShipId;
                    }
                    if( twoGoodShotsSameDirection == 2 ) {
                        lastDirection = 0;
                        lastShotShipId = firstShotShipId;
                    }
                    else {
                        lastDirection = 1;
                        lastShotShipId = firstShotShipId;
                    }
                }
                else {
                    lastDirection = -1; //spudłowaliśmy, więc następny strzał ma być w inną stronę
                }
                setTimeout( function(){whoShoots = 0}, 750);
            }
            else { //jeżeli trafiony
                var id = elem.id.charAt(2);
                id += elem.id.charAt(3);
                toConsole( '<span style="color:red">Komputer: </span>' + letters[(id%10)+1] + Math.floor((id/10)+1) + '<span style="color:yellow"> statek został trafiony!</span>' );

                var tempId = l_shipTable[ id ];
                l_shipTable[ id ] = 0;
                lastShotShipId = id;
                if( firstShotShipId != -1 && twoGoodShotsSameDirection == -1 ) {
                    twoGoodShotsSameDirection = lastDirection;
                }
                if( firstShotShipId == -1 ) { //id pierwszego trafionego punktu statku
                    firstShotShipId = id;
                }
                if(checkIfSunk(l_shipTable, tempId) == true) { //jeżeli statek zatopiony
                    lastShotShipId = -1;
                    firstShotShipId = -1;
                    lastDirection = -1;
                    twoGoodShotsSameDirection = -1;
                    toConsole('<span style="color:red">Komputer: </span><span style="color:purple">STATEK TYPU <span style="color:orange">' + typeOfShip(tempId) + '</span><span style="color:purple"> ZOSTAŁ ZATOPIONY!</span>');
                }
                aiDirections = [ 0, 1, 2, 3 ];
                elem.className = 'v3';
                hit.play();
                hit.currentTime = 0;
                setTimeout(aiRandomShoot, 750);
                whoShoots = 1;
            }
        }
        else {
            window.alert( "'coordinates' array is empty!" );
        }
    }
}

function ai() {
    lastShotShipId = parseInt(lastShotShipId);
    if( lastDirection == -1 ) {
        var temp = rand( 0, aiDirections.length-1 );
        lastDirection = aiDirections[temp];
        aiDirections.splice( temp, 1 );
    }

    aiGoBack();

    if( lastDirection == 0 ) { //w prawo
        if( checkIfExistInCoordinates(lastShotShipId+1) ) { //jeżeli istnieje to można strzelać
            if( Math.floor(lastShotShipId/10) == Math.floor((lastShotShipId+1)/10) ) { //jeżeli nie wyjdzie do następnego wiersza
                removeFromCoordinates( parseInt(lastShotShipId+1) );
                return 'L_' + parseInt(lastShotShipId+1);
            }
        }
        lastDirection = -1;
        return -1;
    }

    if( lastDirection == 1 ) { //w dół
        if( checkIfExistInCoordinates(lastShotShipId+10) ) { //jeżeli istnieje to można strzelać
            if( (lastShotShipId+10) < 100 ) { //jeżeli nie wyjdzie za tabelę
                removeFromCoordinates( parseInt(lastShotShipId+10) );
                return 'L_' + parseInt(lastShotShipId+10);
            }
        }
        lastDirection = -1;
        return -1;
    }

    if( lastDirection == 2 ) { //w lewo
        if( checkIfExistInCoordinates( lastShotShipId-1 ) ) { //jeżeli istnieje to można strzelać
            if( Math.floor(lastShotShipId/10) == Math.floor((lastShotShipId-1)/10) ) { //jeżeli nie wyjdzie do poprzedniego wiersza
                removeFromCoordinates( parseInt(lastShotShipId-1) );
                return 'L_' + parseInt(lastShotShipId-1);
            }
        }
        lastDirection = -1;
        return -1;
    }

    if( lastDirection == 3 ) { //w górę
        if( checkIfExistInCoordinates(lastShotShipId-10) ) { //jeżeli istnieje to można strzelać
            if( (lastShotShipId-10) >= 0 ) { //jeżeli nie wyjdzie przed tabelę
                removeFromCoordinates( parseInt(lastShotShipId-10) );
                return 'L_' + parseInt(lastShotShipId-10);
            }
        }
        lastDirection = -1;
        return -1;
    }

    return -1;
}

function aiGoBack() { //jeżeli wszystkie sąsiednie pola nie istnieją to wracamy do firstShotShipId
    if( ( !checkIfExistInCoordinates( lastShotShipId+1 ) || Math.floor(lastShotShipId/10) != Math.floor((lastShotShipId+1)/10) ) //nie istnieje lub istnieje w następnym wierszu
        && ( !checkIfExistInCoordinates( lastShotShipId-1 ) || Math.floor(lastShotShipId/10) != Math.floor((lastShotShipId-1)/10) ) //nie istnieje lub istnieje w poprzednim wierszu
        && !checkIfExistInCoordinates( lastShotShipId-10 )
        && !checkIfExistInCoordinates( lastShotShipId+10 ) ) {
        lastDirection = -1;
        aiDirections = [ 0, 1, 2, 3 ];
        lastShotShipId = firstShotShipId;
    }
}

function addOnMouseClick( table, ID, whichFunction ) {
    for( var i = 0 ; i < N*N ; i++ ) {
        var elem = document.getElementById( ID + i );
        elem.addEventListener('click', whichFunction, false );
    }
}

function removeOnMouseClick( table, ID, whichFunction ) {
    for( var i = 0 ; i < N*N ; i++ ) {
        var elem = document.getElementById( ID + i );
        elem.removeEventListener('click', whichFunction, false );
    }
}

var table = document.getElementById( 'table1' );
createTableFields( table, 'L_' );

table = document.getElementById( 'table2' );
createTableFields( table, 'R_' );
addOnMouseClick( table, 'R_', shootShip );

function rand( min, max ) //funkcja losujaca liczbę całkowitą z przedziału min,max
{
    min = parseInt( min, 10 );
    max = parseInt( max, 10 );

    if ( min > max ){
        var tmp = min;
        min = max;
        max = tmp;
    }

    return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

var coordinates = new Array(100); //tabela pól gracza; komputer używa jej do strzelania do statków
function coordinatesFill() {
    var k = 0;
    for( var i = 0 ; i < N*N ; i++ ) {
        coordinates[k++] = 'L_' + i;
    }
} coordinatesFill();

function shootCoordinates() { //"strzela" w wylosowanie pole tabeli w poszukiwaniu statku
    if( coordinates.length > 0 ) {
        var num = rand( 0, coordinates.length-1 ); //wylosowanie pola
        var field = coordinates[ num ];
        coordinates.splice( num, 1 ); //usuniecie pola z tablicy
        return field; //zwrocenie pola
    }
}

function checkIfExistInCoordinates( id ) { //sprawdza czy pole o danym id istanieje w coordinates
    for( var i = 0; i < coordinates.length; i++ ) {
        if( coordinates[i] == ("L_"+id) ) {
            return true;
        }
    }
    return false;
}

function removeFromCoordinates( id ) { //usuwa pole o danym id z coordinates
    for( var i = 0; i < coordinates.length; i++ ) {
        if( coordinates[i] == ("L_"+id) ) {
            coordinates.splice( i, 1 );
        }
    }
}

var l_shipTable = new Array(N*N); //tablica statków po lewej stronie
function generateL_shipTable() {
    for( var i = 0 ; i < N*N ; i++ ) {
        l_shipTable[i] = 0;
    }
} generateL_shipTable();

var r_shipTable = new Array(N*N); //tablica statków po prawej stronie
function generateR_shipTable() {
    for( var i = 0 ; i < N*N ; i++ ) {
        r_shipTable[i] = 0;
    }
} generateR_shipTable();

function checkTable( table ) { //sprawdza czy tablica jest pusta
    for( var i = 0; i < table.length; i++ )	{
        if( table[i] != 0 ) { return false; } //nie jest pusta
    }
    return true; //jest pusta
}

function checkIfFieldIsEmpty( num, shipTable, direction ) { //sprawdza czy pola po danej stronie są puste; używana w generacji statków
    switch( direction ) {
        case 0: //po prawej
            if( ( shipTable[num-9] == null || shipTable[num-9] == 0 )
                && ( shipTable[num+1] == null || shipTable[num+1] == 0 )
                && ( shipTable[num+11] == null || shipTable[num+11] == 0 ) ) {
                return true;
            }
            break;
        case 1: //po lewej
            if( ( shipTable[num+10] == null || shipTable[num+10] == 0 )
                && ( shipTable[num+9] == null || shipTable[num+9] == 0 )
                && ( shipTable[num+11] == null || shipTable[num+11] == 0 ) ) {
                return true;
            }
            break;
        case 2: //na dole
            if( ( shipTable[num-11] == null || shipTable[num-11] == 0 )
                && ( shipTable[num+9] == null || shipTable[num+9] == 0 )
                && ( shipTable[num-1] == null || shipTable[num-1] == 0 ) ) {
                return true;
            }
            break;
        case 3: //u góry
            if( ( shipTable[num-11] == null || shipTable[num-11] == 0 )
                && ( shipTable[num-10] == null || shipTable[num-10] == 0 )
                && ( shipTable[num-9] == null || shipTable[num-9] == 0 ) ) {
                return true;
            }
            break;
        default:
            return false;
    }
}

function generateShip4( shipTable, num ) {
    var directionTable = [ 0, 1, 2, 3 ];
    var direction = rand( 0, directionTable.length-1 ); //0 prawo, 1 dół, 2 lewo, 3 góra

    if( direction == 0 ) { //w prawo
        var num2 = num+1;
        if( shipTable[num2] != null && Math.floor(num2/10) == Math.floor(num/10) ) { //czy 1 w prawo jest ok?
            var num3 = num2+1;
            if( shipTable[num3] != null && Math.floor(num3/10) == Math.floor(num2/10) ) { //czy 2 w prawo jest ok?
                var num4 = num3+1;
                if( shipTable[num4] != null && Math.floor(num4/10) == Math.floor(num3/10) ) { //czy 3 w prawo jest ok?
                    shipTable[num] = 40;
                    shipTable[num2] = 40;
                    shipTable[num3] = 40;
                    shipTable[num4] = 40;
                    return false;
                }
            }
        }
    }
    else if( direction == 1 ) { //w dół
        var num2 = num+10;
        if( shipTable[num2] != null ) { //czy 1 w dół jest ok?
            var num3 = num2+10;
            if( shipTable[num3] != null ) { //czy 2 w dół jest ok?
                var num4 = num3+10;
                if( shipTable[num4] != null  ) { //czy 3 w dół jest ok?
                    shipTable[num] = 40;
                    shipTable[num2] = 40;
                    shipTable[num3] = 40;
                    shipTable[num4] = 40;
                    return false;
                }
            }
        }
    }
    else if( direction == 2 ) { //w lewo
        var num2 = num-1;
        if( shipTable[num2] != null && Math.floor(num2/10) == Math.floor(num/10) ) { //czy 1 w lewo jest ok?
            var num3 = num2-1;
            if( shipTable[num3] != null && Math.floor(num3/10) == Math.floor(num2/10) ) { //czy 2 w lewo jest ok?
                var num4 = num3-1;
                if( shipTable[num4] != null && Math.floor(num4/10) == Math.floor(num3/10) ) { //czy 3 w lewo jest ok?
                    shipTable[num] = 40;
                    shipTable[num2] = 40;
                    shipTable[num3] = 40;
                    shipTable[num4] = 40;
                    return false;
                }
            }
        }
    }
    else { //w góre
        var num2 = num-10;
        if( shipTable[num2] != null ) { //czy 1 w góre jest ok?
            var num3 = num2-10;
            if( shipTable[num3] != null ) { //czy 2 w góre jest ok?
                var num4 = num3-10;
                if( shipTable[num4] != null ) { //czy 3 w góre jest ok?
                    shipTable[num] = 40;
                    shipTable[num2] = 40;
                    shipTable[num3] = 40;
                    shipTable[num4] = 40;
                    return false;
                }
            }
        }
    }
    return true;
}

function generateShip3( shipTable, num, id ){
    var directionTable = [ 0, 1, 2, 3 ];
    var direction = rand( 0, directionTable.length-1 ); //0 prawo, 1 dół, 2 lewo, 3 góra

    if( !checkIfFieldIsEmpty(num, shipTable, 0) || !checkIfFieldIsEmpty(num, shipTable, 1) || !checkIfFieldIsEmpty(num, shipTable, 2) || !checkIfFieldIsEmpty(num, shipTable, 3) ) {
        return true;
    }

    if( direction == 0 ) { //w prawo
        var num2 = num+1;
        if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w prawo jest ok?
            var num3 = num2+1;
            if(shipTable[num3] == false && Math.floor(num3/10) == Math.floor(num2/10) && checkIfFieldIsEmpty(num3, shipTable, direction) ) { //czy 2 w prawo jest ok?
                shipTable[num] = 30 + id;
                shipTable[num2] = 30 + id;
                shipTable[num3] = 30 + id;
                return false;
            }
        }
    }
    else if( direction == 1 ) { //w dół
        var num2 = num+10;
        if( shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w dół jest ok?
            var num3 = num2+10;
            if( shipTable[num3] == false && checkIfFieldIsEmpty(num3, shipTable, direction) ) { //czy 2 w dół jest ok?
                shipTable[num] = 30 + id;
                shipTable[num2] = 30 + id;
                shipTable[num3] = 30 + id;
                return false;
            }
        }
    }
    else if( direction == 2 ) { //w lewo
        var num2 = num-1;
        if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w lewo jest ok?
            var num3 = num2-1;
            if( shipTable[num3] == false && Math.floor(num3/10) == Math.floor(num2/10) && checkIfFieldIsEmpty(num3, shipTable, direction) ) { //czy 2 w lewo jest ok?
                shipTable[num] = 30 + id;
                shipTable[num2] = 30 + id;
                shipTable[num3] = 30 + id;
                return false;
            }
        }
    }
    else { //w góre
        var num2 = num-10;
        if(  shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w góre jest ok?
            var num3 = num2-10;
            if(  shipTable[num3] == false && checkIfFieldIsEmpty(num3, shipTable, direction) ) { //czy 2 w góre jest ok?
                shipTable[num] = 30 + id;
                shipTable[num2] = 30 + id;
                shipTable[num3] = 30 + id;
                return false;
            }
        }
    }
    return true;
}

function generateShip2( shipTable, num, id ){
    var directionTable = [ 0, 1, 2, 3 ];
    var direction = rand( 0, directionTable.length-1 ); //0 prawo, 1 dół, 2 lewo, 3 góra

    if( !checkIfFieldIsEmpty(num, shipTable, 0) || !checkIfFieldIsEmpty(num, shipTable, 1) || !checkIfFieldIsEmpty(num, shipTable, 2) || !checkIfFieldIsEmpty(num, shipTable, 3) ) {
        return true;
    }

    if( direction == 0 ) { //w prawo
        var num2 = num+1;
        if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w prawo jest ok?
            shipTable[num] = 20 + id;
            shipTable[num2] = 20 + id;
            return false;
        }
    }
    else if( direction == 1 ) { //w dół
        var num2 = num+10;
        if( shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w dół jest ok?
            shipTable[num] = 20 + id;
            shipTable[num2] = 20 + id;
            return false;
        }
    }
    else if( direction == 2 ) { //w lewo
        var num2 = num-1;
        if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w lewo jest ok?
            shipTable[num] = 20 + id;
            shipTable[num2] = 20 + id;
            return false;
        }
    }
    else {	//w góre
        var num2 = num-10;
        if( shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { //czy 1 w góre jest ok?
            shipTable[num] = 20 + id;
            shipTable[num2] = 20 + id;
            return false;
        }
    }
    return true;
}

function generateShip1( shipTable, num, id ) {
    if( !checkIfFieldIsEmpty(num, shipTable, 0) || !checkIfFieldIsEmpty(num, shipTable, 1) || !checkIfFieldIsEmpty(num, shipTable, 2) || !checkIfFieldIsEmpty(num, shipTable, 3) ) {
        return true;
    }

    if( shipTable[num] == false ) {
        shipTable[num] = 10 + id;
        return false;
    }
    return true;
}

function showShips( table, shipTable ){ //wyświetla wszystkie statki w danej tablicy
    for(var i = 0 ; i < N*N ; i++) {
        if( shipTable[i] != 0 ) {
            var elem = document.getElementById( table + i );
            elem.className = 'v2';
        }
    }
}

function checkIfSunk( shipTable, id ){ //sprawdza czy statek o ID zostal zatopiony
    for(var i = 0 ; i < N*N ; i++) {
        if( shipTable[i] == id ) {
            return false;
        }
    }
    return true;
}

function shipGenerator( shipTable ) {
    var num = rand( 0, shipTable.length-1 );

    //1 statek 4-polowy
    while( generateShip4( shipTable, num ) ) {
        num = rand( 0, shipTable.length-1 );
    };

    //2 statki 3-polowe
    num = rand( 0, shipTable.length-1 );
    while( generateShip3( shipTable, num, 1 ) ) {
        num = rand( 0, shipTable.length-1 );
    };
    num = rand( 0, shipTable.length-1 );
    while( generateShip3( shipTable, num, 2 ) ) {
        num = rand( 0, shipTable.length-1 );
    };

    //3 statki 2-polowe
    num = rand( 0, shipTable.length-1 );
    while( generateShip2( shipTable, num, 1 ) ) {
        num = rand( 0, shipTable.length-1 );
    };
    num = rand( 0, shipTable.length-1 );
    while( generateShip2( shipTable, num, 2 ) ) {
        num = rand( 0, shipTable.length-1 );
    };
    num = rand( 0, shipTable.length-1 );
    while( generateShip2( shipTable, num, 3 ) ) {
        num = rand( 0, shipTable.length-1 );
    };

    //4 statki 1-polowe
    num = rand( 0, shipTable.length-1 );
    while( generateShip1( shipTable, num, 1 ) ) {
        num = rand( 0, shipTable.length-1 );
    };
    num = rand( 0, shipTable.length-1 );
    while( generateShip1( shipTable, num, 2 ) ) {
        num = rand( 0, shipTable.length-1 );
    };
    num = rand( 0, shipTable.length-1 );
    while( generateShip1( shipTable, num, 3 ) ) {
        num = rand( 0, shipTable.length-1 );
    };
    num = rand( 0, shipTable.length-1 );
    while( generateShip1( shipTable, num, 4 ) ) {
        num = rand( 0, shipTable.length-1 );
    };
    showShips( "L_", l_shipTable );
}
shipGenerator( l_shipTable );
shipGenerator( r_shipTable );


function toConsole( message ) {
    for( var i = 6; i > 0; i-- ) {
        document.getElementById( "message" + i ).innerHTML = document.getElementById( "message" + (i-1) ).innerHTML;
    }
    document.getElementById( "message0" ).innerHTML = message;
}

function typeOfShip( id ) {
    if( Math.floor( id/10 ) == 4 ) {
        return "czteromasztowiec";
    }
    if( Math.floor( id/10 ) == 3 ) {
        return "trójmasztowiec";
    }
    if( Math.floor( id/10 ) == 2 ) {
        return "dwumasztowiec";
    }
    return "jednomasztowiec";
}