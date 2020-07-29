const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

// declare variables
const game = new Phaser.Game(config)
let platforms
let player
let cursors
let stars
let score = 0
let scoreText
let bombs

function preload() {
    // load in our assets
    this.load.image('sky', 'assets/sky.png')
    this.load.image('ground', 'assets/platform.png')
    this.load.image('star', 'assets/star.png')
    this.load.image('bomb', 'assets/bomb.png')
    this.load.spritesheet('dude', 'assets/dude.png', {
        frameWidth: 32, frameHeight: 48
    })
}

function create() {
    // sky background
    this.add.image(400, 300, 'sky') // images are positioned based on their centre
    // alternatively you can use: this.add.image(400, 300, 'sky').setOrigin(0, 0)

    // platforms
    platforms = this.physics.add.staticGroup()
    platforms.create(400, 568, 'ground').setScale(2).refreshBody() // without refreshBody it won't double in size
    platforms.create(600, 400, 'ground')
    platforms.create(50, 250, 'ground')
    platforms.create(750, 220, 'ground')

    // player
    player = this.physics.add.sprite(100, 450, 'dude')
    player.setBounce(0.2) // the bounce animation
    player.setCollideWorldBounds(true)
    this.physics.add.collider(player, platforms)

    // player animations (running)
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 10
    })

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })

    // stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    })

    stars.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })
    this.physics.add.collider(stars, platforms)
    this.physics.add.overlap(player, stars, collectStar, null, this)

    // bombs
    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)

    // scoring
    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize: '32px', fill: '#fff'
    })
}

function update() {
    cursors = this.input.keyboard.createCursorKeys()

    if (cursors.left.isDown) { // go left
        player.setVelocityX(-160)
        player.anims.play('left', true)
    } else if (cursors.right.isDown) { // go right
        player.setVelocityX(160)
        player.anims.play('right', true)
    } else { // do nothing
        player.setVelocityX(0)
        player.anims.play('turn')
    }

    // jumping
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330)
    }
}

function collectStar(player, star) {
    star.disableBody(true, true) // hide the star when collected
    score += 10 // add to the score
    scoreText.setText(`Score: ${score}`) // update the scoreText

    if (stars.countActive(true) === 0) { // if all stars have been collected
        stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true) // add stars back in
        })

        // determine the player's position
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
        let bomb = bombs.create(x, 16, 'bomb') // add a bomb
        bomb.setBounce(1) // makes the bomb bounce around the screen indefinitely
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20) // give it a random speed
    }
}

function hitBomb(player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000)
    player.anims.play('turn')
    gameOver = true
}