//Global
var playerLives;
var damageThrowTimeOut = false;
var gameTimeOuts = [];
var runningTimeOuts = []; 
var footHitTimeOuts = [];
var ringsTimeOuts = [];

//GameOver loop
var gameOver = {
    preload: function(){
        //Game Over Image
        game.load.image('gameOver',                    'assets/gameover.jpg')
    },
    create: function(){
        background = game.add.sprite(0, 0, 'gameOver');
        //Game HUD
        gameOverHud = game.add.text(230, 555, 'Game Over',{ 
            fontSize: '100px',
            fill: '#fff',
            stroke: '#000000',
            strokeThickness: 6
        });
    },
    update: function(){
    }
}
var mainState = {
    // Preloads assets to be instanciated and rendered
    preload: function(){
        //World Blocks
        game.load.image('greenHill',                    'assets/world/greenHillBigger.jpg'),
        game.load.image('groundTile',                   'assets/world/groundTile.png');
        game.load.image('groundTileSquare',             'assets/world/groundTileSquare.png');
        game.load.image('blockTile',                    'assets/world/blockTile.png');
        game.load.image('blockTileShadow',              'assets/world/blockTileShadow.png');
        game.load.image('spike',                        'assets/world/spike.png');
        
        //HUD
        game.load.image('sanic',                        'assets/sanic.png');
        
        //Ugandan
        game.load.image('ugandanKnucles',                        'assets/ugandan_knucles.png');
        
        //Interactable Objects
        game.load.spritesheet('ring',                   'assets/interactable/rings.png', 35, 33);
        game.load.spritesheet('ringMonitor',            'assets/interactable/ringMonitor.png', 30, 34);
        
        //Player Objects
        game.load.spritesheet('sonicStanding',          'assets/sonic/sonicStanding.png', 36, 41);
        game.load.spritesheet('sonicRunning',           'assets/sonic/sonicSprite.png', 41, 40);
        game.load.spritesheet('sonicJump',              'assets/sonic/sonicJump.png', 32, 33);
        game.load.spritesheet('sonicFalling',           'assets/sonic/sonicFalling.png', 39, 32);
        game.load.spritesheet('sonicDied',              'assets/sonic/sonicDied.png', 33, 40);
        
        //Sound Effects
        game.load.audio('ringSound',                    'assets/sounds/ring-effect.mp3');
        game.load.audio('jumpSound',                    'assets/sounds/jump.mp3');
    },
    
    // Instanciate all objects to be rendered
    create: function(){
        
        //Start Arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Setting game bounds [Default is the game window size]
        game.world.setBounds(0,0, 4096, 700);
        
        //Ring Sound
        ringSound = game.add.audio('ringSound');
        ringSound.allowMultiple = true;
        ringSound.addMarker('getRing', 0, 0.7);
        
        //Jump Sound
        jumpSound = game.add.audio('jumpSound');
        jumpSound.allowMultiple = true;
        jumpSound.addMarker('jump', 0, 1.5);
        
        //Player Lives
        if(isNaN(playerLives)){
            playerLives = 3;
        }
        if(playerLives < 0){
            game.state.start('gameOver');
        }
        
        //Rings
        playerRings = 0;
      
        //Add sky tile
        var background;
        var backgroundLimit = Math.round((4096 / 1024) + 1);
        
        //Background
        for(var i = 0; i < backgroundLimit; i++){
            var backgroundPosition;
            if(i === 0){
               backgroundPosition = 0;
            }
            background = game.add.sprite(backgroundPosition, 0, 'greenHill');
            background.scale.setTo(1, 1);
            backgroundPosition = backgroundPosition + 1024;
        }

        //Block group
        blockGroup = game.add.group();
        blockGroup.enableBody = false;
        
        //Platform group
        platforms = game.add.group();
        platforms.enableBody = true;
        
        // Ring Monitor Group
        ringMonitor = game.add.group();
        ringMonitor.enableBody = true;
        
        //Rings group
        rings = game.add.group();
        rings.enableBody = true;
        
        //Spike group
        spikes = game.add.group();
        spikes.enableBody = true;
        
        var groundLimit = Math.round((this.world.width / 128) + 1);
        var ugandanKnucles = game.add.sprite(10, game.world.height - 240, 'ugandanKnucles');
        
        //Player
        player = game.add.sprite(400, game.world.height - 200, 'sonicRunning');
        player.frame = 8;
        game.physics.arcade.enable(player);
        player.scale.setTo(1.7, 1.7);
        player.body.bounce.y = 0.2;
        player.body.gravity.y =  600;
        player.body.setSize(21,40,15);
        player.body.collideWorldBounds = true;
        playerScore = 0;
        
        //Above platform structure blocks
        this.createBlock(0, game.world.height - 228, 2, false);
        this.createBlock(0, game.world.height - 356, 2, false);
        this.createBlock(0, game.world.height - 484, 2, true);
        
        //Above platform ground blocks
        this.createPlatforms(0, game.world.height - 510);
        this.createPlatforms(64, game.world.height - 510);
        this.createPlatforms(128, game.world.height - 510);
        this.createPlatforms(192, game.world.height - 510);
        
        //Ring Monitors
        this.createRingMonitor(20, 140, 4);
        this.createRingMonitor(200 ,game.world.height - 150, 1);
        
        //Rings
        this.createRings(500, game.world.height - 165, 10, false);
        
        //Rings over spikes
        this.createRings(1250, game.world.height - 165, 1, false);
        this.createRings(1300, game.world.height - 200, 1, false);
        this.createRings(1350, game.world.height - 235, 1, false);
        this.createRings(1400, game.world.height - 270, 1, false);
        this.createRings(1450, game.world.height - 235, 1, false);
        this.createRings(1500, game.world.height - 200, 1, false);
        this.createRings(1550, game.world.height - 165, 1, false);
        
        //Ground
        this.createGround(0, game.world.height - 100, 10);
        this.createBlock(0, game.world.height - 37, 10);
        this.createGround(1525, game.world.height - 100, 10);
        this.createBlock(1525, game.world.height - 37, 10);
        
        //Spikes
        this.createSpike(1280, game.world.height - 50, 3);
         
        //Defines keyboard variables
        spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        
        //Player jump action set
        spaceKey.onDown.add(this.jump, this);
        leftKey.onDown.add(this.moveLeft, this);
        leftKey.onUp.add(this.moveLeftStop, this);
        rightKey.onDown.add(this.moveRight, this);
        rightKey.onUp.add(this.moveRightStop, this);
        enterKey.onDown.add(this.restartGame, this);
        
        // Key binding for validations
        cursors = game.input.keyboard.createCursorKeys();
        game.camera.follow(player);
        
        //Game HUD
        var sanicLivesMonitor = game.add.sprite(25, game.world.height - 60, 'sanic');
        sanicLivesMonitor.scale.setTo(0.75, 0.75);
        gameHudLives = game.add.text(90, game.world.height - 45, 'X ' + playerLives,{ 
            fill: 'yellow',
            stroke: '#000000',
            strokeThickness: 6
        });
        gameHudRings = game.add.text(10, 10, 'Rings: ' + playerRings,{ 
            fill: 'yellow',
            stroke: '#000000',
            strokeThickness: 6
        });
        gameHudSanic = game.add.text(90, game.world.height - 65, 'Sanic',{ 
            fontSize: '18px',
            fill: 'yellow',
            stroke: '#000000',
            strokeThickness: 4
        });
        endCaption = game.add.text(2900, 500, "Unfortunately that's all folks T.T", { 
            fontSize: '18px',
            fill: 'white',
            stroke: '#000000',
            strokeThickness: 4
        });
        gameHudRings.fixedToCamera = true;
        gameHudLives.fixedToCamera = true;
        sanicLivesMonitor.fixedToCamera = true;
        gameHudSanic.fixedToCamera = true;
     },
    //Update Function, Renders at 60 fps
    update: function(){
        // Sets collision between the character and the platforms
        var hitPlatform             = game.physics.arcade.collide(player, platforms, this.collisionHandlerPlatform, null, this);
        var hitPlatformRigMonitor   = game.physics.arcade.collide(platforms, ringMonitor, null, this);
        var hitRingMonitor          = game.physics.arcade.collide(player, ringMonitor, this.collisionHandlerRingMonitor, this.collisionHandlerRingMonitorProcess, this);
        var hitSpikes               = game.physics.arcade.collide(player, spikes, this.collisionHandlerSpikes, null, this);
        var hitRings                = game.physics.arcade.overlap(player, rings, this.collisionHandlerRings, null, this);
        var hitRingsPlatforms       = game.physics.arcade.collide(rings, platforms);
        var hitRingsSpikes          = game.physics.arcade.collide(rings, spikes);
        
        if(!damageThrowTimeOut){
            if(cursors.left.isDown || cursors.right.isDown){
                for(var i = 0; i < footHitTimeOuts.length; i++){
                    clearTimeout(footHitTimeOuts[i]);
                }
            }
            document.onkeyup = function(event){
                if(event.keyCode == 37 || event.keyCode == 39){
                    for(var i = 0; i < runningTimeOuts.length; i++){
                        clearTimeout(runningTimeOuts[i]);
                    }
                }
            }
        }
    },
    moveLeft: function(){
        if(!damageThrowTimeOut){
            player.body.setSize(21,40,0);
            player.animations.stop();
            this.animationControl("runningLeft");
            player.body.velocity.x = -150;
            runningTimeOuts.push(setTimeout(function(){
                player.body.velocity.x = -300;
                runningTimeOuts.push(setTimeout(function(){
                    player.body.velocity.x = -500;
                },5000))
            }, 2000));
        }
    },
    moveLeftStop: function(){
        if(!damageThrowTimeOut){
            player.body.velocity.x = 0;
            player.animations.stop();
            this.animationControl("standingLeft");
            footHitTimeOuts.push(setTimeout(function(){
                mainState.animationControl("standingLeftFootHitting");
            }, 5000));
        }
    },
    moveRight: function(){
        if(!damageThrowTimeOut){
            player.body.setSize(21,40,15);
            player.animations.stop();
            this.animationControl("runningRight");
            player.body.velocity.x = 150;
            runningTimeOuts.push(setTimeout(function(){
                player.body.velocity.x = 300;
                runningTimeOuts.push(setTimeout(function(){
                    player.body.velocity.x = 500;
                },5000))
            }, 2000));
        }
    },
    moveRightStop: function(){
        if(!damageThrowTimeOut){
            player.body.velocity.x = 0;
            player.animations.stop();
            this.animationControl("standingRight");
            footHitTimeOuts.push(setTimeout(function(){
                mainState.animationControl("standingRightFootHitting");
            }, 5000));
        }
    },
    jump: function(){
        if(!damageThrowTimeOut){
            if(player.body.touching.down){
                jumpSound.play('jump');
                this.animationControl("jump");
            }
        }
    },
    collisionHandlerPlatform: function(player, platform){
        if(damageThrowTimeOut){
            this.animationControl("standingRight");
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            damageThrowTimeOut = false;
        }
    },
    collisionHandlerRingMonitorProcess: function(playerCollide, ringMonitorCollide){
        if(playerCollide.body.speed > 350){
            return true;
        }else{
            return false;
        }
    },
    collisionHandlerRingMonitor: function(playerCollide, ringMonitorCollide){ 
        ringMonitorCollide.body.checkCollision.up = false;
        ringMonitorCollide.frame = 1;
        playerRings = playerRings + 10;
        gameHudRings.setText('Rings: ' + playerRings);
    },
    collisionHandlerRings: function(playerCollide, ringsCollide){
        ringSound.play('getRing');
        ringsCollide.destroy();
        playerRings = playerRings + 1;
        gameHudRings.setText('Rings: ' + playerRings);
    },
    collisionHandlerSpikes: function(playerCollide, spikeCollide){
        if(parseInt(playerRings) > 0){
            damageThrowTimeOut = true;
            this.timeOutControl("runningTimeOut");
            
            player.animations.stop();
            player.body.velocity.y = -450;
            player.body.velocity.x = -250;
            
            var throwRings = Math.round(playerRings / 2);
            this.createRings(player.position.x,  player.position.y - 165, throwRings, true);
            
            playerRings = 0;
            gameHudRings.setText('Rings: ' + playerRings);
            this.animationControl("fallingRight");
        }else{
            damageThrowTimeOut = true;
            playerLives = playerLives - 1;
            player.animations.stop();
            player.body.collideWorldBounds = false;
            this.animationControl("died");
            player.body.velocity.y = -450;
            spikes.forEach(function (spike) { spike.body.enable = false; });
            gameTimeOuts.push(setTimeout(this.restartGame, 4000))
        }
    },
    animationControl: function(animationType){
        switch(animationType){
            case "standingLeft":
                player.loadTexture('sonicStanding');
                player.animations.add('standingLeft',               [15], 5, true);
                player.animations.play('standingLeft');
            break;
            case "standingLeftFootHitting":
                player.loadTexture('sonicStanding');
                player.animations.add('standingLeftFootHitting',    [11,12,11], 5, true);
                player.animations.play('standingLeftFootHitting');
            break;
            case "standingRight":
                player.loadTexture('sonicStanding');
                player.animations.add('standingRight',              [16], 5, true);
                player.animations.play('standingRight');
            break;
            case "standingRightFootHitting":
                player.loadTexture('sonicStanding');
                player.animations.add('standingRightFootHitting',   [19,20,19], 5, true);
                player.animations.play('standingRightFootHitting');
            break;
            case "runningLeft":
                player.loadTexture('sonicRunning');
                player.animations.add('runningLeft', [0,1,2,3,4,5,6], 10, true);
                player.animations.play('runningLeft');
            break;
            case "runningRight":
                player.loadTexture('sonicRunning');
                player.animations.add('runningRight', [9,10,11,12,13,14,15], 10, true);
                player.animations.play('runningRight');
            break;
            case "jump":
                player.loadTexture('sonicJump');
                player.body.setSize(32,32 ,0);
                player.body.velocity.y = -450;
            break;
            case "fallingLeft":
                player.loadTexture('sonicFalling');
                player.animations.add('fallingLeft',   [0,1], 10, true);
                player.animations.play('fallingLeft ');
            break;
            case "fallingRight":
                player.loadTexture('sonicFalling');
                player.animations.add('fallingRight',  [2,3], 10, true);
                player.animations.play('fallingRight');
            break;
            case "died":
                player.loadTexture('sonicDied');
                player.frame = 2;
            break;
        }
    },
    createRingMonitor: function(x, y, amount){
            //RingMonitors
            var ringMonitor1;
            if(amount > 1){
               for(var i = 0; i < amount; i++){
                    if(i == 0){
                       var spacer = x;
                    }
                    ringMonitor1 = ringMonitor.create(spacer, y, 'ringMonitor');
                    ringMonitor1.body.immovable = true;
                    ringMonitor1.scale.setTo(1.5, 1.5);
                    ringMonitor1.body.setSize(25,30,3, 0);
                    ringMonitor1.body.checkCollision.up = true;
                    ringMonitor1.body.checkCollision.left = false;
                    ringMonitor1.body.checkCollision.right = false;
                    spacer = spacer + 50;
                }
            }else{
                ringMonitor1 = ringMonitor.create(x, y, 'ringMonitor');
                ringMonitor1.body.immovable = true;
                ringMonitor1.scale.setTo(1.5, 1.5);
                ringMonitor1.body.setSize(25,30,3,0);
                ringMonitor1.body.checkCollision.up = true;
                ringMonitor1.body.checkCollision.left = false;
                ringMonitor1.body.checkCollision.right = false;
            }
        },   
        createSpike: function(x, y, amount){
            //Spikes
            var spike;
            if(amount > 1){
               for(var i = 0; i < amount; i++){
                    if(i == 0){
                       var spacer = x;
                    }
                    spike = spikes.create(spacer, y, 'spike');
                    spike.collideWorldBounds = true;
                    spike.body.immovable = true;
                    spike.scale.setTo(0.60, 0.40);
                    spike.body.setSize(130,100,3,40);
                    spike.body.checkCollision.up = true;
                    spike.body.checkCollision.left = false;
                    spike.body.checkCollision.right = false;
                    spike.immovable = true;
                    spacer = spacer + 80;
                }
            }else{
                spike = ringMonitor.create(x, y, 'spike');
                spike.collideWorldBounds = true;
                spike.body.immovable = true;
                spike.scale.setTo(1.5, 1.5);
                spike.body.setSize(130,100,3,40);
                spike.body.checkCollision.up = true;
                spike.body.checkCollision.left = false;
                spike.body.checkCollision.right = false;
                spike.immovable = true;
            }
        },
        createBlock: function(x, y, amount, shadow){
            var blocksPlatform;
            if(amount > 1){
                for(var i = 0; i < amount; i++){
                    var width;
                    if(i === 0){
                       width = x;
                    }
                    blocksPlatform = blockGroup.create(width, y, (shadow ? 'blockTileShadow':'blockTile'));
                    width = width + 128;
                }
                
            }else{
                blocksPlatform = blockGroup.create(x, y, (shadow ? 'blockTileShadow':'blockTile'));
            }
        },
        createPlatforms: function(x,y){
            var groundPlatform;
            groundPlatform = platforms.create(x, y, 'groundTileSquare');
            groundPlatform.body.immovable = true;
        },
        createGround: function (x,y,amount){
            if(amount > 1){
                for(var i = 0; i < amount; i++){
                    var ground;
                    var tileWidth;
                    if(i === 0){
                       tileWidth = x;
                    }
                    ground = platforms.create(tileWidth, y, 'groundTile');
                    ground.body.immovable = true;
                    tileWidth = tileWidth + 128;
                }
            }else{
                var ground;
                ground = platforms.create(x, y, 'groundTile');
                ground.body.immovable = true;
            }
        },
    createRings: function(x,y,amount, gravity){
        if(amount > 1 || gravity){
            for(var i = 0; i < amount; i++){
                var ring;
                var positionX;
                if(i === 0){
                    positionX = x;
                }
                ring = rings.create(positionX, y, 'ring');
                if(gravity){
                    var randomX = this.getRandomValues(0, 3);
                    var randomXDiretion = this.getRandomValues(0, 1);
                    var randomY = this.getRandomValues(0, 3);
                    
                    game.physics.arcade.enable(ring);
                    ring.body.gravity.y =  600;
                    ring.body.velocity.y = -(randomY * 100);
                    if(randomXDiretion == 0){
                        ring.body.velocity.x = -(randomX * 100);
                    }else if(randomXDiretion == 1){
                        ring.body.velocity.x = (randomX * 100);
                    }
                    ringsTimeOuts.push(setTimeout(function(){
                        ring.destroy();
                    }, 3000));
                }
                ring.animations.add('rings', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33], 60, true);
                ring.animations.play('rings');
                positionX = positionX + 50;
            }
        }else{
            ring = rings.create(x, y, 'ring');
            ring.animations.add('rings', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33], 60, true);
            ring.animations.play('rings');
        }
    },
    timeOutControl: function(type){
        switch(type){
            case "footHitTimeOut":
                for(var i = 0; i < footHitTimeOuts.length; i++){
                    clearTimeout(footHitTimeOuts[i]);
                }
            break;
            case "runningTimeOut":
                for(var i = 0; i < runningTimeOuts.length; i++){
                    clearTimeout(runningTimeOuts[i]);
                }
            break;
        }
    },
    getRandomValues: function getRandomArbitrary(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    },
    restartGame: function(){
        game.state.start('main');
    },
/*    render: function(){
        game.debug.cameraInfo(game.camera, 32, 32);
        game.debug.bodyInfo(player, 200, 350);
        game.debug.body(player);
    }*/
    //Used for debbuging purposes
}

var game = new Phaser.Game(1024, 702);
game.state.add('main',      mainState);
game.state.add('gameOver',  gameOver);
game.state.start('main');