var letters = [ '', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','U' ]; // używane przez legendę
var whoShoots = 0;
var N = 10;	// ilość pól N*N

var miss = new Audio("./sound/miss.mp3");
miss.loop = false;
miss.autoplay = false;

var hit = new Audio("./sound/hit.mp3");
hit.loop = false;
hit.autoplay = false;

var lastDirection = -1;
var gambleDirections = [ 0, 1, 2, 3 ];
var lastShotShipId = -1; // id ostatniego trafionego pola przez komputer
var firstShotShipId = -1;// id pierwszego trafionego pola przez komputer w celach zawracania ostrzału
var curentShipSize = 0;

function createTableFields( table, ID ) {
	// tworzymy nad polami legendę
	var tr = document.createElement( "TR" );
	table.appendChild( tr );

	for( var i = 0 ; i <= N ; i++ ) {
		var elem = document.createElement( "TH" );
		elem.appendChild( document.createTextNode( letters[ i ] ) );
		tr.appendChild( elem );
	}

	// tworzymy pola pod legendą
	for( var i = 1 ; i <= N ; i++ ) {
		// tworzymy nowy wiersz
		tr = document.createElement( "TR" );
		table.appendChild( tr );

		// po lewej stronie ma być legenda z numerami pól
		var elem = document.createElement( "TH" );
		elem.appendChild( document.createTextNode( i ) );
		tr.appendChild( elem );

		// tworzymy pola w tabeli
		for( var j = 1 ; j <= N ; j++ ) {
			elem = document.createElement( "TD" );
			elem.id = ID + (((i-1)*N) +(j-1)); // N czy 10?
			elem.className = 'v0';

			tr.appendChild( elem );
		}
	}
}

var table = document.getElementById( 'table1' );
createTableFields( table, 'L_' );

var table2 = document.getElementById( 'table2' );
createTableFields( table2, 'R_' );

function rand( min, max ) // funkcja losujaca liczbe calkowita z przedzialu min,max
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

var l_shipTable = new Array(N*N); // tablica statków po lewej stronie
function generateL_shipTable() {
	for( var i = 0 ; i < N*N ; i++ ) {
		l_shipTable[i] = 0;
	}
} generateL_shipTable();

var r_shipTable = new Array(N*N); // tablica statków po prawej stronie

function checkTable( table ) { //sprawdza czy tablica jest pusta
	for( var i = 0; i < table.length; i++ )	{
		if( table[i] != 0 ) { return false; } //nie jest pusta
	}
	return true; //jest pusta
}

function checkIfFieldIsEmpty( num, shipTable, direction ) {
	if( direction == 0 ) { // w prawo
		if( ( shipTable[num-9] == null || shipTable[num-9] == 0 )
			&& ( shipTable[num+1] == null || shipTable[num+1] == 0 )
			&& ( shipTable[num+11] == null || shipTable[num+11] == 0 ) ) {
				return true;
		}
	}
	if( direction == 1 ) { // w dół
		if( ( shipTable[num+10] == null || shipTable[num+10] == 0 )
			&& ( shipTable[num+9] == null || shipTable[num+9] == 0 )
			&& ( shipTable[num+11] == null || shipTable[num+11] == 0 ) ) {
				return true;
		}
	}
	if( direction == 2 ) { // w lewo
		if( ( shipTable[num-11] == null || shipTable[num-11] == 0 )
			&& ( shipTable[num+9] == null || shipTable[num+9] == 0 )
			&& ( shipTable[num-1] == null || shipTable[num-1] == 0 ) ) {
				return true;
		}
	}
	if( direction == 3 ) { // w góra
		if( ( shipTable[num-11] == null || shipTable[num-11] == 0 )
			&& ( shipTable[num-10] == null || shipTable[num-10] == 0 )
			&& ( shipTable[num-9] == null || shipTable[num-9] == 0 ) ) {
				return true;
		}
	}
	return false;
}

function generateShip4( shipTable, num ) {
	var directionTable = [ 0, 1, 2, 3 ];
	var direction = rand( 0, directionTable.length-1 ); //0 prawo, 1 dół, 2 lewo, 3 góra

	if( direction == 0 ) { // w prawo
		var num2 = num+1;
		if( shipTable[num2] != null && Math.floor(num2/10) == Math.floor(num/10) ) { // czy 1 w prawo jest ok?
			var num3 = num2+1;
			if( shipTable[num3] != null && Math.floor(num3/10) == Math.floor(num2/10) ) { // czy 2 w prawo jest ok?
				var num4 = num3+1;
				if( shipTable[num4] != null && Math.floor(num4/10) == Math.floor(num3/10) ) { // czy 3 w prawo jest ok?
					shipTable[num] = 40;
					shipTable[num2] = 40;
					shipTable[num3] = 40;
					shipTable[num4] = 40;
					return false;
				}
			}
		}
	}
	else if( direction == 1 ) { // w dół
		var num2 = num+10;
		if( shipTable[num2] != null ) { // czy 1 w dół jest ok?
			var num3 = num2+10;
			if( shipTable[num3] != null ) { // czy 2 w dół jest ok?
				var num4 = num3+10;
				if( shipTable[num4] != null  ) { // czy 3 w dół jest ok?
					shipTable[num] = 40;
					shipTable[num2] = 40;
					shipTable[num3] = 40;
					shipTable[num4] = 40;
					return false;
				}
			}
		}
	}
	else if( direction == 2 ) { // w lewo
		var num2 = num-1;
		if( shipTable[num2] != null && Math.floor(num2/10) == Math.floor(num/10) ) { // czy 1 w lewo jest ok?
			var num3 = num2-1;
			if( shipTable[num3] != null && Math.floor(num3/10) == Math.floor(num2/10) ) { // czy 2 w lewo jest ok?
				var num4 = num3-1;
				if( shipTable[num4] != null && Math.floor(num4/10) == Math.floor(num3/10) ) { // czy 3 w lewo jest ok?
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
		if( shipTable[num2] != null ) { // czy 1 w góre jest ok?
			var num3 = num2-10;
			if( shipTable[num3] != null ) { // czy 2 w góre jest ok?
				var num4 = num3-10;
				if( shipTable[num4] != null ) { // czy 3 w góre jest ok?
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

	if( direction == 0 ) { // w prawo
		var num2 = num+1;
		if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w prawo jest ok?
			var num3 = num2+1;
			if(shipTable[num3] == false && Math.floor(num3/10) == Math.floor(num2/10) && checkIfFieldIsEmpty(num3, shipTable, direction) ) { // czy 2 w prawo jest ok?
				shipTable[num] = 30 + id;
				shipTable[num2] = 30 + id;
				shipTable[num3] = 30 + id;
				return false;
			}
		}
	}
	else if( direction == 1 ) { // w dół
		var num2 = num+10;
		if( shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w dół jest ok?
			var num3 = num2+10;
			if( shipTable[num3] == false && checkIfFieldIsEmpty(num3, shipTable, direction) ) { // czy 2 w dół jest ok?
				shipTable[num] = 30 + id;
				shipTable[num2] = 30 + id;
				shipTable[num3] = 30 + id;
				return false;
			}
		}
	}
	else if( direction == 2 ) { // w lewo
		var num2 = num-1;
		if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w lewo jest ok?
			var num3 = num2-1;
			if( shipTable[num3] == false && Math.floor(num3/10) == Math.floor(num2/10) && checkIfFieldIsEmpty(num3, shipTable, direction) ) { // czy 2 w lewo jest ok?
				shipTable[num] = 30 + id;
				shipTable[num2] = 30 + id;
				shipTable[num3] = 30 + id;
				return false;
			}
		}
	}
	else { //w góre
		var num2 = num-10;
		if(  shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w góre jest ok?
			var num3 = num2-10;
			if(  shipTable[num3] == false && checkIfFieldIsEmpty(num3, shipTable, direction) ) { // czy 2 w góre jest ok?
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

	if( direction == 0 ) { // w prawo
		var num2 = num+1;
		if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w prawo jest ok?
			shipTable[num] = 20 + id;
			shipTable[num2] = 20 + id;
			return false;
		}
	}
	else if( direction == 1 ) { // w dół
		var num2 = num+10;
		if( shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w dół jest ok?
			shipTable[num] = 20 + id;
			shipTable[num2] = 20 + id;
			return false;
		}
	}
	else if( direction == 2 ) { // w lewo
		var num2 = num-1;
		if( shipTable[num2] == false && Math.floor(num2/10) == Math.floor(num/10) && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w lewo jest ok?
			shipTable[num] = 20 + id;
			shipTable[num2] = 20 + id;
			return false;
		}
	}
	else {	//w góre
		var num2 = num-10;
		if( shipTable[num2] == false && checkIfFieldIsEmpty(num2, shipTable, direction) ) { // czy 1 w góre jest ok?
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
	if( shipTable[num] == true ) {
		return true;
	}
	shipTable[num] = 10 + id;
	return false;
}

function showShips( table, shipTable ){ // wyświetla wszystkie statki w danej tablicy
	for(var i = 0 ; i < N*N ; i++) {
		if( shipTable[i] != 0 ) {
			var elem = document.getElementById( table + i );
			elem.className = 'v2';
		}
	}
}

function shipGenerator( shipTable ) {
	var num = rand( 0, shipTable.length-1 );

	// 1 statek 4-polowy
	while( generateShip4( shipTable, num ) ) {
		num = rand( 0, shipTable.length-1 );
	};

	// 2 statki 3-polowe
	num = rand( 0, shipTable.length-1 );
	while( generateShip3( shipTable, num, 1 ) ) {
		num = rand( 0, shipTable.length-1 );
	};
	num = rand( 0, shipTable.length-1 );
	while( generateShip3( shipTable, num, 2 ) ) {
		num = rand( 0, shipTable.length-1 );
	};

	// 3 statki 2-polowe
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

	// 4 statki 1-polowe
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


function toConsole( message ) {
	for( var i = 6; i > 0; i-- ) {
		document.getElementById( "message" + i ).innerHTML = document.getElementById( "message" + (i-1) ).innerHTML;
	}
	document.getElementById( "message0" ).innerHTML = message;
}

function typeOfShip( id ) {
	if( Math.floor( id/10 ) == 4 ) {
		return "CZTEROMASZTOWIEC";
	}
	if( Math.floor( id/10 ) == 3 ) {
		return "TRÓJMASZTOWIEC";
	}
	if( Math.floor( id/10 ) == 2 ) {
		return "DWUMASZTOWIEC";
	}
	return "JEDNOMASZTOWIEC";
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

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

var myUser = null; //nasz id usera
var enemyUser = null; //id przeciwnika
var whichUserInitializedGame;
var game; // nasza gra
var whoseTurn;
var setEnemyUser;
var boardChangeListener;
var thisField; //by mieć id pola dla removeListener w innej funkcji
var gameOverListener;
var connectionLost;
var gameover = false;

var shootShip = function() { // strzelanie do pól przeciwnika
	thisField = this;
	this.removeEventListener('click', shootShip, false );

	firebase.database().ref( '/lobby/'+game+'/whoseTurn' ).once('value').then(
		function( snapshot ) {
			whoseTurn = snapshot.val();
		}
	).then(
		function() {
			if( whichUserInitializedGame == 'myUser' && whoseTurn != 1 ) { //nie możemy strzelać
				toConsole( 'Ruch <span style="color:red">przeciwnika!</span>' );
				thisField.addEventListener('click', shootShip, false );
				return;
			} else if( whichUserInitializedGame == 'enemyUser' && whoseTurn != 2 ) { //nie możemy strzelać
				toConsole( 'Ruch <span style="color:red">przeciwnika!</span>' );
				thisField.addEventListener('click', shootShip, false );
				return;
			}

			//toConsole( "Bum!" );
			var id = thisField.id.charAt(2);
				id += thisField.id.charAt(3);

			if( r_shipTable[ id ] == 0 ) { // pudło!
				toConsole( '<span style="color:green">Gracz: </span>' + letters[(id%10)+1] + Math.floor((id/10)+1) + '<span style="color:#5eefff"> pudło!</span>' );
				thisField.className = 'v1';
				thisField.innerHTML = 'X';
				firebase.database().ref( '/lobby/'+game+'/' ).update({
					whoseTurn: whoseTurn==1?2:1
				});
				
				var updates = {};
				updates['/board/' + id] = 1;
				firebase.database().ref( '/boards/'+enemyUser+'/').update(updates);

				miss.currentTime = 0;
				miss.play();
				toConsole( 'Ruch <span style="color:red">przeciwnika.</span>' );
			} else { // trafiony!
				toConsole( '<span style="color:green">Gracz: </span><span style="color:yellow">trafiłeś statek </span><span style="color:red">przeciwnika </span>' + letters[(id%10)+1] + Math.floor((id/10)+1) );
				
				var temp_id = r_shipTable[ id ];
				r_shipTable[ id ] = 0;
				thisField.className = 'v3';
				var updates = {};
				updates['/board/' + id] = 3;
				firebase.database().ref( '/boards/'+enemyUser+'/').update(updates);
				
				if(checkIfSunk(r_shipTable, temp_id) == true){
					toConsole( '<span style="color:green">Gracz: </span>Statek <span style="color:red">PRZECIWNIKA </span>typu <span style="color:orange">' + typeOfShip(temp_id) + '</span> został zatopiony!' );
				}
				
				hit.currentTime = 0;
				hit.play();
			}

			if( checkTable(r_shipTable) ) {
				gameover = true;
				removeOnMouseClick( document.getElementById( 'table2' ), 'R_', shootShip );
				toConsole( "<h1>WYGRAŁEŚ!</h1>" );
				firebase.database().ref( '/lobby/'+game+'/gameover' ).off('value', gameOverListener);
				firebase.database().ref( '/lobby/'+game+'/' ).update({
					gameover: true
				});
				firebase.database().ref( '/boards/'+enemyUser+'/').update(updates);
				firebase.database().ref( '/boards/'+myUser+'/board' ).off('value', boardChangeListener);
				firebase.database().ref( '/lobby/'+game+'/' ).remove();
				firebase.database().ref( '/boards/'+myUser+'/' ).remove();
			}
		}
	);
}

function checkIfSunk( shipTable, id ){ //sprawdza czy statek o ID zostal zatopiony
	for(var i = 0 ; i < N*N ; i++) {
		if( shipTable[i] == id ) {
			return false;
		}
	}
	return true;
}

function periodicallyCheckConnection() {
	if( gameover == false ) {
		firebase.database().ref( '/boards/'+myUser+'/' ).update({
			timestamp: Date.now()
		});
	}
	
	if( gameover == false ) {
		firebase.database().ref( '/boards/' + enemyUser + '/timestamp' ).once('value').then(
			function( snapshot ) {
				if( Date.now() - snapshot.val() > 30000 ) {
					toConsole( "<h1>UTRACONO POŁĄCZENIE Z PRZECIWNIKIEM</h1>" );
					removeOnMouseClick( document.getElementById( 'table2' ), 'R_', shootShip );
					firebase.database().ref( '/lobby/'+game+'/gameover' ).off('value', gameOverListener);
					firebase.database().ref( '/boards/'+myUser+'/board' ).off('value', boardChangeListener);
					firebase.database().ref( '/boards/'+enemyUser+'/' ).remove();
					firebase.database().ref( '/lobby/'+game+'/' ).remove();
					firebase.database().ref( '/boards/'+myUser+'/' ).remove();
					connectionLost = true;
		}}).then( function() {
			if( connectionLost == false && gameover == false ) {
				setTimeout(periodicallyCheckConnection,10000);
			}
		});
	}
}

function createUserInDatabase() {
	firebase.database().ref( '/boards/' ).once('value').then(
		function( snapshot ) {
			var i = 0;
			var j = 0;
			var check = 0;

			while( snapshot.child("user" + i ).val() ) { // sprawdzamy ile mamy userow w bazie
				i++; // i zostaje standardowo wieksze aby potem w razie w w to miejsce stworzyc nowego usera
			}
			if( snapshot.val() == null) { // user nie istnieje, tworzymy nowego usera
				firebase.database().ref( '/boards/user'+0+'/').set({
					timestamp: Date.now(),
					board: l_shipTable //tu przesyłamy naszą planszę
				});
				check = 0;
				myUser = "user0";
			}

			while( j < i ) {
				var timestamp = (snapshot.child("user"+j).val().timestamp); // sprawdzenie czasu danego usera
				if( parseInt( timestamp )+3000000 < Date.now() ) { //stary user, przejmujemy go jako nasz
					firebase.database().ref( '/boards/user'+j+'/').set({
						timestamp: Date.now(), //jeżeli starsze niż np. 2 godziny to usuwamy
						board: l_shipTable //tu przesyłamy naszą planszę
					});
					check = 1;
					myUser = "user" + j;
					break;
				}
				j++;
			}
			
			if( check == 0 ) {
				firebase.database().ref( '/boards/user'+i+'/').set({
					timestamp: Date.now(), //jeżeli starsze niż np. 2 godziny to usuwamy
					board: l_shipTable //tu przesyłamy naszą planszę
				});
				check = 0;
				myUser = "user" + i;
			}
		}
	);
	toConsole( 'Oczekiwanie na <span style="color:red">przeciwnika...</span>' );
} createUserInDatabase();

function createGameInDatabase() { // tworzymy games
	return firebase.database().ref( '/lobby/' ).once('value').then(
		function( snapshot ) {
			var i = 0;
			var j = 0;
			var check = 0;

			while(snapshot.child("game" + i ).val()){ // sprawdzamy ile mamy userow w bazie
				i++; // i zostaje standardowo wieksze aby potem w razie w w to miejsce stworzyc nowego usera
			}

			if( snapshot.val() == null ){ // żadny game nie istnieje, tworzymy nowy game
				firebase.database().ref( '/lobby/game'+0+'/').set({
					timestamp: Date.now(), //jeżeli starsze niż np. 2 godziny to usuwamy
					freeToJoin: true,
					gameover: false,
					user1: myUser,
					user2: "placeholder", // coś że ni ma
					whoseTurn: 1 // ten który zrobił ustawił te rzeczy ten zaczyna
				});
				game = "game0";
				whichUserInitializedGame = "myUser";
				check = 0;
			}

			while( j < i ) {
				if( snapshot.child("game"+j).val().freeToJoin == true ) { // jeżeli dołączamy się do istniejącej gry
					firebase.database().ref( '/lobby/game'+j+'/').update({
						timestamp: Date.now(),
						freeToJoin: false,
						user2: myUser
					});
					game = "game" + j;
					
					enemyUser = snapshot.child(game).val().user1;
					whichUserInitializedGame = "enemyUser";
					check = 1;
					break;
				}

				var timestamp = (snapshot.child('game'+j).val().timestamp); // sprawdzenie czasu danego usera

				if( parseInt( timestamp )+3000000 < Date.now() ) { //stary user, przejmujemy go jako nasz
					firebase.database().ref( '/lobby/game'+j+'/').set({
						timestamp: Date.now(), //jeżeli starsze niż np. 2 godziny to usuwamy
						freeToJoin: true,
						gameover: false,
						user1: myUser,
						user2: "placeholder", // coś że ni ma
						whoseTurn: 1 // ten który zrobił ustawił te rzeczy ten zaczyna
					});
					game = "game" + j;
					whichUserInitializedGame = "myUser";
					check = 1;
					break;
				}

				j++;
			}

			if( check == 0 ) {
				firebase.database().ref( '/lobby/game'+i+'/').set({
					timestamp: Date.now(), //jeżeli starsze niż np. 2 godziny to usuwamy
					freeToJoin: true,
					gameover: false,
					user1: myUser,
					user2: "placeholder", // coś że ni ma
					whoseTurn: 1 // ten który zrobił ustawił te rzeczy ten zaczyna
				});
				game = "game" + i;
				whichUserInitializedGame = "myUser";
				check = 0;
			}
		}
	).then(
		function() {
			setEnemyUser = firebase.database().ref( '/lobby/' + game + '/user2' ).on('value', function(snapshot) { //ustawiamy przeciwnika
				if( whichUserInitializedGame == 'myUser' ) { //user, który stworzył lobby
					enemyUser = snapshot.val();
					firebase.database().ref( '/boards/' + enemyUser + '/board' ).once('value').then(
						function( snapshot ) {
						if( enemyUser != 'placeholder' && enemyUser != null ) {
							var temp = snapshot.val();
							for( var i = 0; i < N*N; i++ ) {
								r_shipTable[i] = temp[i];
							}
							addOnMouseClick( 'table2', 'R_', shootShip );
							toConsole( 'Połączyłeś się z <span style="color:red">przeciwnikiem.</span>' );
							toConsole( '<span style="color:green">Zaczynasz</span> grę.' );
							if( connectionLost == undefined ) {
								connectionLost = false;
								periodicallyCheckConnection();
							}

							boardChangeListener = firebase.database().ref( '/boards/'+myUser+'/board' ).on('value', function(snapshot) {
								for(var i = 0 ; i < N*N ; i++) {
									var elem = document.getElementById( 'L_' + i );
									switch( snapshot.val()[i] ) {
										case 0: //woda
											elem.className = 'v0';
											break;
										case 1: //pudło
											elem.className = 'v1';
											elem.innerHTML = 'X';
											toConsole( '<span style="color:red">Przeciwnik: </span>' + letters[(i%10)+1] + Math.floor((i/10)+1) + '<span style="color:#5eefff"> pudło!</span>' );
											miss.play();
											miss.currentTime = 0;
											var updates = {};
											updates['/board/' + i] = 4;
											firebase.database().ref( '/boards/'+myUser+'/').update(updates);
											toConsole( '<span style="color:green">Twój</span> ruch!' );
											break;
										case 3: //trafiony statek
											elem.className = 'v3';
											toConsole( '<span style="color:red">Przeciwnik: </span>' + letters[(i%10)+1] + Math.floor((i/10)+1) + '<span style="color:yellow"> statek trafiony!</span>' );
											hit.play();
											hit.currentTime = 0;
											var temp_id = l_shipTable[ i ];
											l_shipTable[i] = 0;
											if(checkIfSunk(l_shipTable,temp_id) == true){
												toConsole( '<span style="color:red">Przeciwnik: </span>statek typu <span style="color:orange">' + typeOfShip(temp_id) + '</span> został zatopiony!' );
											}
											var updates = {};
											updates['/board/' + i] = 5;
											firebase.database().ref( '/boards/'+myUser+'/').update(updates);
											break;
										case 4: //pudło stare (nie ma odtwarzać dźwięku)
											elem.className = 'v1';
											elem.innerHTML = 'X';
											break;
										case 5: //trafiony statek stary (nie ma odtwarzać dźwięku)
											elem.className = 'v3';
											break;
										default:
											elem.className = 'v2';
									}
								}
							});
							
							gameOverListener = firebase.database().ref( '/lobby/'+game+'/gameover' ).on('value', function(snapshot) {
								if( snapshot.val() == true ) {
									removeOnMouseClick( document.getElementById( 'table2' ), 'R_', shootShip );
									firebase.database().ref( '/boards/'+myUser+'/board' ).off('value', boardChangeListener);
									toConsole( "<h1>PRZEGRAŁEŚ! :(</h1>" );
									gameover = true;
									showShips( "R_", r_shipTable );
									firebase.database().ref( '/lobby/'+game+'/gameover' ).off('value', gameOverListener);
									firebase.database().ref( '/boards/'+myUser+'/' ).remove();
								}
							});
							firebase.database().ref( '/lobby/' + game + '/user2' ).off('value', setEnemyUser);
						}
					});
				} else { //user, który się dołączył do lobby
					firebase.database().ref( '/boards/' + enemyUser + '/board' ).once('value').then(
						function( snapshot ) {
						if( enemyUser != 'placeholder' && enemyUser != null ) {
							var temp = snapshot.val();
							for( var i = 0; i < N*N; i++ ) {
								r_shipTable[i] = temp[i];
							}
							addOnMouseClick( 'table2', 'R_', shootShip );
							toConsole( 'Połączyłeś się z <span style="color:red">przeciwnikiem.</span>' );
							toConsole( 'Ruch <span style="color:red">przeciwnika.</span>' );
							if( connectionLost == undefined ) {
								connectionLost = false;
								periodicallyCheckConnection();
							}
						}
					});
					
					boardChangeListener = firebase.database().ref( '/boards/'+myUser+'/board' ).on('value', function(snapshot) {
						for(var i = 0 ; i < N*N ; i++) {
							var elem = document.getElementById( 'L_' + i );
							switch( snapshot.val()[i] ) {
								case 0: //woda
									elem.className = 'v0';
									break;
								case 1: //pudło
									elem.className = 'v1';
									elem.innerHTML = 'X';
									toConsole( '<span style="color:red">Przeciwnik: </span>' + letters[(i%10)+1] + Math.floor((i/10)+1) + '<span style="color:#5eefff"> pudło!</span>' );
									miss.play();
									miss.currentTime = 0;
									var updates = {};
									updates['/board/' + i] = 4;
									firebase.database().ref( '/boards/'+myUser+'/').update(updates);
									toConsole( '<span style="color:green">Twój</span> ruch!' );
									break;
								case 3: //trafiony statek
									elem.className = 'v3';
									toConsole( '<span style="color:red">Przeciwnik: </span><span style="color:green">Twój </span>' + letters[(i%10)+1] + Math.floor((i/10)+1) + '<span style="color:yellow"> statek trafiony!</span>' );
									hit.play();
									hit.currentTime = 0;
									var temp_id = l_shipTable[ i ];
									l_shipTable[i] = 0;
									if(checkIfSunk(l_shipTable,temp_id) == true){
										toConsole( '<span style="color:red">Przeciwnik: </span><span style="color:green">Twój </span>statek typu <span style="color:orange">' + typeOfShip(temp_id) + '</span> został zatopiony!' );
									}
									var updates = {};
									updates['/board/' + i] = 5;
									firebase.database().ref( '/boards/'+myUser+'/').update(updates);
									break;
								case 4: //pudło stare (nie ma odtwarzać dźwięku)
									elem.className = 'v1';
									elem.innerHTML = 'X';
									break;
								case 5: //trafiony statek stary (nie ma odtwarzać dźwięku)
									elem.className = 'v3';
									break;
								default:
									elem.className = 'v2';
							}
						}
					});
					
					gameOverListener = firebase.database().ref( '/lobby/'+game+'/gameover' ).on('value', function(snapshot) {
						if( snapshot.val() == true ) {
							removeOnMouseClick( document.getElementById( 'table2' ), 'R_', shootShip );
							toConsole( "<h1>PRZEGRAŁEŚ! :(</h1>" );
							gameover = true;
							showShips( "R_", r_shipTable );
							firebase.database().ref( '/boards/'+myUser+'/board' ).off('value', boardChangeListener);
							firebase.database().ref( '/lobby/'+game+'/gameover' ).off('value', gameOverListener);
							firebase.database().ref( '/boards/'+myUser+'/' ).remove();
						}
					});
					firebase.database().ref( '/lobby/' + game + '/user2' ).off('value', setEnemyUser);
				}
			});
		}
	);
} createGameInDatabase();