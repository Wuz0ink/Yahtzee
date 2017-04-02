class Game extends Base {

    constructor(){
        super();

        this.users = new UserList(); // skapar en userList
        this.dices = new DiceList(); // skapar dicelist
        this.counter = 0;
        this.idGame; //Undefined here, will be defined in startGame()
        this.startGame();
    }

    


    startGame(){

        var tempIdGame = 0;

        //Hämtar högsta idGame från databasen
        this.db.getGame((data)=>{
            tempIdGame = data[0].maxGame;
            console.log('Hämtar högsta idGame från db', data);

            //Plussar på 
            this.idGame = tempIdGame+1;
        
            //Lägger till nytt game i databasen
            this.db.newGame({idGame: this.idGame}, (data)=>{
                console.log('Lägger till nytt game i db', data);
            });

        });

    }

    //Knappen Add users
    createUsers(){ 
        var thisGame = this;

        $('#addUser').html('');
        this.users.createUsers((user) => {
            //Efter att funktionen createUsers har kört klart, så gör de här sakerna:
            setTimeout(function(){
                this.users = user;
                console.log(this.users);
                
                this.users.display('#addUser');

                thisGame.saveGameRoundToDB();
            }, 50);
        });
        

    }

    saveGameRoundToDB(){
        var userName;

        console.log('hi', this.users);
        for (var user of this.users){
            console.log('hej');
            userName = user.userName;
            this.db.newGameHasUser({User_username: userName},(data)=>{
                console.log('lägger till user i game_has_user', userName);
            });
        }

    }


    pressedRoll(){ // funktion då man trycker på knappen "Roll"
        this.counter++;
        if(this.counter == 3){
            // set button "Roll" to inactive
            $('#roll').attr("disabled", true);
            this.dices.rollDice();
            
             this.users.setScore((b1)=>{
                 console.log(b1);
                if(b1){
                    alert('Game done!');
                }else{
                    this.counter = 0;
                    this.dices.resetRoll();
                    $('#roll').attr("disabled", false);
                }
            });
            

        }else{
            this.dices.rollDice();
            $('#user').attr("disabled", true); // det ska inte gå att lägga till users när spelet har börjat
        }

    }

    static get sqlQueries(){
        return {
            getGame: `
                SELECT max(idGame) as maxGame FROM Game limit 1
`,        
            newGame: `
                INSERT into Game SET ?
`,
            newGameHasUser: `
                INSERT into Game_has_User SET ?
`
        }
    }
}
