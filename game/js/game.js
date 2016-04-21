var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    ENEMYS_SPAWN = 5,
    SCORE_OFFSET = 1,
    STONE_BREAKER = 10;
    canvas = null,
    ctx = null,
    lastPress = null,
    pause = true,
    gameover = true,
    dir = 0,
    score = 0,
    wall = new Array(),
    player = null,
    food = null;

var KEY_A = 65,
    KEY_W = 87,
    KEY_D = 68,
    KEY_S = 83,
    KEY_SPACE = 32;

var barreras = [];

var dirConstructor = 0;

var lastPressConstructor = null;

var center =  null;
var score = 0.00;
var recursos = 0;
var pressing = [];

var playerConstructor = null;

var TILESIZE = 32;
var base = new Image();
var sprite = new Image();
sprite.src = 'img/rpg_char.png';
base.src = 'img/BASE.png';

                        //         80, 96 
// var spriteEnemigoOgro = new Image(320, 384);
var spriteEnemigoOgro = new Image(160, 192);
spriteEnemigoOgro.src = "img/Monster2.jpg";

var spriteConstructor = new Image(96, 128);
spriteConstructor.src = "img/rpg_char2.png";

var spriteRoca = new Image(32, 32);
spriteRoca.src = "img/rockwall.png";

var direccionesEnemigo = {
    0: {
        x: 0,
        y: 288
        //y: 288
    },
    1: {
        x: 0,
        //y: 96
        y: 192
    },
    2: {
        x: 0,
        y: 0
    },
    3: {
        x: 0,
        //y:48
         y: 96
    }
};

var direcciones = {
    0: {
        x: 32,
        y: 96
    },
    1: {
        x: 32,
        y: 64
    },
    2: {
        x: 0,
        y: 0
    },
    3: {
        x: 0,
        y: 32
    },
};

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 17);
    };
}());

document.addEventListener('keydown',function(evt){ lastPress=evt.keyCode; pressing[evt.keyCode]=true; },false);

document.addEventListener('keyup',function(evt){ pressing[evt.keyCode]=false; },false); 

function Rectangle(x, y, width, height, dir) {
    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
    this.width = (width == null) ? 0 : width;
    this.height = (height == null) ? this.width : height;
    this.dir = (dir == null) ? null : dir;

    this.intersects = function(rect) {
        if (rect == null) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y);
        }
    };

    this.fill = function(ctx) {
        if (ctx == null) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}

Rectangle.prototype.drawImageArea = function (ctx, img, sx, sy, sw, sh) {
    if (img.width) ctx.drawImage(img, sx, sy, sw, sh, this.x, this.y, this.width, this.height); 
    else ctx.strokeRect(this.x, this.y, this.width, this.height);
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function reset() {
    score = 0;
    dir = 1;
    player.x = canvas.width/2;
    player.y = canvas.height/2;
    wall = [];
    recursos = 0;
    score = 0.00;
    ENEMYS_SPAWN = 5;

    barreras = [];
    playerConstructor.x = 64;
    playerConstructor.y = 64;
    dirConstructor = 1;
    gameover = false;
}

function paint(ctx) {
    var i = 0,
        l = 0; 
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var img = new Image(800, 800);
    //le decimos la ruta de la imagen, en este caso html5.jpg
    img.src = "img/Lvl 1.png";
    //pasamos la imagen al 2d del canvas y se dibujará
    //en 0 0 podemos poner las cordenadas de donde empezar a dibujar la imagen
    ctx.drawImage(img, 0, 0);

    // Pintar Centro
    ctx.fillStyle = '#00B';
    center.fill(ctx);
    ctx.drawImage(base, (canvas.width / 2) - 70, (canvas.height / 2) - 60);

    // Draw player 
    //ctx.fillStyle = '#0f0';
    //player.fill(ctx);

    player.drawImageArea(ctx, sprite, direcciones[dir].x, direcciones[dir].y, 32, 32);
    playerConstructor.drawImageArea(ctx, spriteConstructor, direcciones[dirConstructor].x, direcciones[dirConstructor].y, 32, 32);

    // Draw walls 
    ctx.fillStyle = '#009';

    for (i = 0, l = wall.length; i < l; i += 1) {
        //wall[i].fill(ctx);
        wall[i].drawImageArea(ctx, spriteEnemigoOgro, direccionesEnemigo[wall[i].dir].x, direccionesEnemigo[wall[i].dir].y, 80, 96);
    } // Draw food 

    for (i = 0; i < barreras.length; i++) {
        barreras[i].drawImageArea(ctx, spriteRoca, 0, 0, 32, 32);
    }
    ctx.fillStyle = '#f00';
    //food.fill(ctx); // Debug last key pressed 
    ctx.fillStyle = '#fff'; //ctx.fillText('Last Press: '+lastPress,0,20); // Draw score ctx.fillText('Score: ' + score, 0, 10); // Draw pause 
    //ctx.textAlign = 'center';
    if (pause) {
        if (gameover) {
            ctx.fillText('GAME OVER', canvas.width/2 - 50, canvas.height/2);
        } else {
            ctx.fillText('PAUSE', canvas.width/2 - 50, canvas.heigth/2);
        }
        ctx.textAlign = 'left';
    }
    //else {
      ctx.fillText('SCORE: ' + Math.floor(score), 50, 50);
      ctx.fillText('RECURSOS: ' + recursos, canvas.width - 200, 50);
    //}
}

function act() {
    var i = 0, l;
    if (!pause) { // GameOver Reset 
        if (gameover) {
            reset();
        } // Change Direction 
        if (lastPress == KEY_UP) {
            dir = 0;
        }
        if (lastPress == KEY_RIGHT) {
            dir = 1;
            //player.drawImageArea(ctx, sprite, 32, 64, 32, 32);
        }
        if (lastPress == KEY_DOWN) {
            dir = 2;
            //player.drawImageArea(ctx, sprite, 0, 0, 32, 32);
        }
        if (lastPress == KEY_LEFT) {
            dir = 3;
            //player.drawImageArea(ctx, sprite, 32, 32, 32, 32);
        } // Move Rect 
        // Move Rect 
        if(pressing[KEY_UP] && player.y > 0) player.y-=2; 
        if (pressing[KEY_RIGHT] && player.x < canvas.width - 32) player.x += 2;
        if (pressing[KEY_DOWN] && player.y < canvas.height - 32) player.y += 2;
        if (pressing[KEY_LEFT] && player.x > 2) player.x -= 2;

        /*if (player.x > canvas.width) {
            player.x = 0;
        }*/
        if (player.y > canvas.height) {
            player.y = 0;
        }
        /*if (player.x < 0) {
            player.x = canvas.width;
        }*/
        if (player.y < 0) {
            player.y = canvas.height;
        } 
         // Enemys Intersects 
        while (i < wall.length) {
            var killed = enemyMove(wall[i]);
            if (center.intersects(wall[i])) {
                gameover = true;
                pause = true;
                 //killed = true;
                console.log('Llego un mamey');
            }
            if (player.intersects(wall[i]) || playerConstructor.intersects(wall[i])) {
                //gameover = true;
                //pause = true;
                killed = true;
                console.log('Lo mataste');
            }
            /*if(wall[i].intersects(center)) {
              gameover = true;
              paused = true;  
              console.log('Perdiste');
              break;
            }*/
            if(killed) {
              wall.splice(i,1);
              recursos += 10;
              score += 1;
            }
            //else {
              i++;
            //}
        }
        score +=0.10;
        if(score/ 50 > SCORE_OFFSET) {
          ENEMYS_SPAWN++;
          SCORE_OFFSET++;
        }
    }
    // Pause/Unpause 
    if (lastPress == KEY_ENTER) {
        pause = !pause;
        lastPress = null;
    }
}

function actConstructor() {
    var i, l;
    if (!pause) { // GameOver Reset 
        if (gameover) {
            reset();
        } // Change Direction 
        if (lastPressConstructor == KEY_W) {
            dirConstructor = 0;
        }
        if (lastPressConstructor == KEY_D) {
            dirConstructor = 1;
            //player.drawImageArea(ctx, sprite, 32, 64, 32, 32);
        }
        if (lastPressConstructor == KEY_S) {
            dirConstructor = 2;
            //player.drawImageArea(ctx, sprite, 0, 0, 32, 32);
        }
        if (lastPressConstructor == KEY_A) {
            dirConstructor = 3;
            //player.drawImageArea(ctx, sprite, 32, 32, 32, 32);
        } // Move Rect 
        // Move Rect 
         if(pressing[KEY_W] && playerConstructor.y > 0) playerConstructor.y-=2; 
        if (pressing[KEY_D] && playerConstructor.x < canvas.width - 32) playerConstructor.x += 2;
        if (pressing[KEY_S] && playerConstructor.y < canvas.height - 32) playerConstructor.y += 2;
        if (pressing[KEY_A] && playerConstructor.x > 2) playerConstructor.x -= 2;

        if (pressing[KEY_SPACE] && recursos >= 30) {
            // Hacer que ponga una pared
            if (dirConstructor == 0) {
                // ARIBA
                // barreras.push(new Rectangle(playerConstructor.x - playerConstructor.width, playerConstructor.y, 32, 32, playerConstructor.dir));
                // playerConstructor.drawImageArea(ctx, spriteRoca, playerConstructor.x - playerConstructor.width, playerConstructor.y, 32, 32);
                barreras.push(new Rectangle(playerConstructor.x, playerConstructor.y - playerConstructor.height, 32, 32, playerConstructor.dir));
            }

            if (dirConstructor == 1) {
                // DERECHA
                barreras.push(new Rectangle(playerConstructor.x + playerConstructor.width, playerConstructor.y, 32, 32, playerConstructor.dir));
            }

            if (dirConstructor == 2) {
                // ABAJO
                barreras.push(new Rectangle(playerConstructor.x, playerConstructor.y + playerConstructor.height, 32, 32, playerConstructor.dir));
            }

            if (dirConstructor == 3) {
                // IZQUIERDA
                barreras.push(new Rectangle(playerConstructor.x - playerConstructor.width, playerConstructor.y, 32, 32, playerConstructor.dir));
            }
            recursos -= 30;
        }

        if (playerConstructor.x > canvas.width) {
            playerConstructor.x = 0;
        }
        if (playerConstructor.y > canvas.height) {
            playerConstructor.y = 0;
        }
        if (playerConstructor.x < 0) {
            playerConstructor.x = canvas.width;
        }
        if (playerConstructor.y < 0) {
            playerConstructor.y = canvas.height;
        } 
    } // Pause/Unpause 
}

function enemyMove(enemy) {
  if(actBarreras(enemy)) {
    switch(enemy.dir) {
      case 0:
        enemy.y -= 1;
        break;
      case 1:
        enemy.x += 1;
        break;
      case 2:
        enemy.y += 1;
        break;
      case 3:
        enemy.x -= 1;
        break;
      default:
        break;
    }
  }
  return enemy.x > canvas.width || enemy.x < 0 || enemy.y < 0 || enemy.y > canvas.height;
}

function actBarreras(enemy) {
  for(var i = 0; i < barreras.length; i++) {
    if(barreras[i].intersects(enemy)) {
      if(enemy.blocked === STONE_BREAKER) {
        barreras.splice(i,1);
      }
      enemy.blocked++;
      return false;
    }
  }
  return true;
}

function repaint() {
    window.requestAnimationFrame(repaint);
    paint(ctx);
}

function run() {
    setTimeout(run, 17);
    act();
    actConstructor();
}

function init() { // Get canvas and context 
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d'); // Create player and food 
    player = new Rectangle(canvas.width/2, canvas.height/2, 32, 32);
    playerConstructor = new Rectangle(64, 64, 32, 32);
    center = new Rectangle((canvas.width / 2) - 60, (canvas.height / 2) - 40, 90, 80);
    //food = new Rectangle(80, 80, 10, 10); // Create walls 
    ctx.font = '15px Arial';
    run();
    repaint();
    
}

function cargarEnemigo() {
    var direccion = random(4);
    var x = direccion === 0 || direccion === 2 ? random(canvas.width - 40) 
                                                : direccion === 1 ? 0 : canvas.width - 40;
    var y = direccion === 1 || direccion === 3 ? random(canvas.height - 48)
                                                : direccion === 2 ? 0 : canvas.height - 48;
    var enemy = new Rectangle(x, y, 40, 48, direccion);
    enemy.blocked = 0;
    wall.push(enemy);
}

function cargarEnemigos() {
    if(!pause) {
      var cuantos = random(ENEMYS_SPAWN);
      //wall = [];
      for (var i = 0; i < cuantos; i++) {
          cargarEnemigo();
      }
    }
}

function actEnemies() {
    var objetivoEnemigoX;
    var objetivoEnemigoY;
}

window.addEventListener('load', init, false);
var ogreSpawner = setInterval(cargarEnemigos, 2000);
