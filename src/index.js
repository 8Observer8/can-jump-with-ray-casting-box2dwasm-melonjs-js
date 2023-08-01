import * as me from "melonjs";
import { box2d, initBox2D } from "./init-box2d.js";
import DebugDrawer from "./debug-drawer.js";
import RayCastCallback from "./ray-cast-callback.js";
import Keyboard from "./keyboard.js";

me.device.onReady(
    () => {
        if (!me.video.init(300, 300, {
                parent: "screen",
                renderer: me.video.CANVAS,
                scale: "fit",
                antiAlias: true
            })) //
        {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        async function init() {
            await initBox2D();

            class Graphics extends me.Renderable {
                constructor() {
                    super(0, 0, me.game.viewport.width, me.game.viewport.height);
                    this.anchorPoint.set(0, 0);

                    this.keyboard = new Keyboard();
                    this.playerJumpVelocity = -7;
                    this.playerWalkVelocity = 3;

                    const {
                        b2_dynamicBody,
                        b2BodyDef,
                        b2CircleShape,
                        b2PolygonShape,
                        b2Vec2,
                        b2World,
                        getPointer
                    } = box2d;

                    this.world = new b2World();
                    const gravity = new b2Vec2(0, 9.8);
                    this.world.SetGravity(gravity);
                    this.pixelsPerMeter = 30;

                    this.debugDrawer = new DebugDrawer(me.game.renderer, this.pixelsPerMeter);
                    this.world.SetDebugDraw(this.debugDrawer.instance);

                    this.metaData = {};
                    this.isLeftGroundRay = false;
                    this.isRightGroundRay = false;
                    this.isGround = false;

                    this.upRayCastCallback = new RayCastCallback(me.game.renderer,
                        this.pixelsPerMeter, this.upRayCastHandler.bind(this));

                    this.leftDownRayCastCallback = new RayCastCallback(me.game.renderer,
                        this.pixelsPerMeter, this.leftDownRayCastHandler.bind(this));

                    this.rightDownRayCastCallback = new RayCastCallback(me.game.renderer,
                        this.pixelsPerMeter, this.rightDownRayCastHandler.bind(this));

                    // Ground
                    const groundBodyDef = new b2BodyDef();
                    groundBodyDef.set_position(new b2Vec2(150 / this.pixelsPerMeter, 285 / this.pixelsPerMeter));
                    const groundBody = this.world.CreateBody(groundBodyDef);
                    const groundShape = new b2PolygonShape();
                    groundShape.SetAsBox(270 / 2 / this.pixelsPerMeter, 15 / 2 / this.pixelsPerMeter);
                    const groundFixture = groundBody.CreateFixture(groundShape, 0);
                    groundFixture.SetFriction(3);
                    this.metaData[getPointer(groundFixture)] = {
                        name: "ground"
                    };

                    // Player
                    const playerBodyDef = new b2BodyDef();
                    playerBodyDef.type = b2_dynamicBody;
                    playerBodyDef.position = new b2Vec2(140 / this.pixelsPerMeter,
                        220 / this.pixelsPerMeter);
                    this.playerBody = this.world.CreateBody(playerBodyDef);
                    this.playerBody.SetFixedRotation(true);
                    const playerShape = new b2CircleShape();
                    playerShape.m_radius = 20 / this.pixelsPerMeter;
                    const playerFixture = this.playerBody.CreateFixture(playerShape, 1);
                    playerFixture.SetFriction(3);
                    this.metaData[getPointer(playerFixture)] = {
                        name: "player"
                    };

                    // First platform
                    const firstPlatformBodyDef = new b2BodyDef();
                    firstPlatformBodyDef.set_position(new b2Vec2(125 / this.pixelsPerMeter,
                        150 / this.pixelsPerMeter));
                    firstPlatformBodyDef.angle = 0 * Math.PI / 180;
                    const firstPlatformBody = this.world.CreateBody(firstPlatformBodyDef);
                    const firstPlatformShape = new b2PolygonShape();
                    firstPlatformShape.SetAsBox(70 / 2 / this.pixelsPerMeter, 15 / 2 / this.pixelsPerMeter);
                    const firstPlatformFixture = firstPlatformBody.CreateFixture(firstPlatformShape, 0);
                    firstPlatformFixture.SetFriction(3);
                    this.metaData[getPointer(firstPlatformFixture)] = {
                        name: "first platform"
                    };

                    // Second platform
                    const secondPlatformBodyDef = new b2BodyDef();
                    secondPlatformBodyDef.set_position(new b2Vec2(225 / this.pixelsPerMeter,
                        220 / this.pixelsPerMeter));
                    secondPlatformBodyDef.angle = 0 * Math.PI / 180;
                    const secondPlatformBody = this.world.CreateBody(secondPlatformBodyDef);
                    const secondPlatformShape = new b2PolygonShape();
                    secondPlatformShape.SetAsBox(70 / 2 / this.pixelsPerMeter, 15 / 2 / this.pixelsPerMeter);
                    const secondPlatformFixture = secondPlatformBody.CreateFixture(secondPlatformShape, 0);
                    secondPlatformFixture.SetFriction(3);
                    this.metaData[getPointer(secondPlatformFixture)] = {
                        name: "second platform"
                    };
                }

                upRayCastHandler(fixture_p, point_p, normal_p, fraction) {
                    const {
                        b2Fixture,
                        getPointer,
                        wrapPointer
                    } = box2d;

                    const fixture = wrapPointer(fixture_p, b2Fixture);
                    const name = this.metaData[getPointer(fixture)].name;

                    if (name === "first platform") {
                        console.log(name);
                    } else if (name === "second platform") {
                        console.log(name);
                    }
                }

                leftDownRayCastHandler(fixture_p, point_p, normal_p, fraction) {
                    const {
                        b2Fixture,
                        getPointer,
                        wrapPointer
                    } = box2d;

                    const fixture = wrapPointer(fixture_p, b2Fixture);
                    const name = this.metaData[getPointer(fixture)].name;

                    if (name === "first platform" || name === "second platform" ||
                        name === "ground") //
                    {
                        this.isLeftGroundRay = true;
                    }
                }

                rightDownRayCastHandler(fixture_p, point_p, normal_p, fraction) {
                    const {
                        b2Fixture,
                        getPointer,
                        wrapPointer
                    } = box2d;

                    const fixture = wrapPointer(fixture_p, b2Fixture);
                    const name = this.metaData[getPointer(fixture)].name;

                    if (name === "first platform" || name === "second platform" ||
                        name === "ground") //
                    {
                        this.isRightGroundRay = true;
                    }
                }

                keyboardHandler() {
                    if (this.keyboard.pressed("KeyW") || this.keyboard.pressed("ArrowUp")) {
                        if (this.isGround) {
                            const velocity = this.playerBody.GetLinearVelocity();
                            velocity.y = this.playerJumpVelocity;
                            this.playerBody.SetLinearVelocity(velocity);
                        }
                    }

                    if (this.keyboard.pressed("KeyA") || this.keyboard.pressed("ArrowLeft")) {
                        const velocity = this.playerBody.GetLinearVelocity();
                        velocity.x = -this.playerWalkVelocity;
                        this.playerBody.SetLinearVelocity(velocity);
                    }

                    if (this.keyboard.pressed("KeyD") || this.keyboard.pressed("ArrowRight")) {
                        const velocity = this.playerBody.GetLinearVelocity();
                        velocity.x = this.playerWalkVelocity;
                        this.playerBody.SetLinearVelocity(velocity);
                    }
                }

                update(dt) {
                    this.keyboardHandler();
                    this.world.Step(dt / 1000, 3, 2);
                    return true;
                }

                draw(renderer) {
                    const {
                        b2Vec2
                    } = box2d;

                    renderer.clearColor("#000000");
                    renderer.setGlobalAlpha(1);

                    this.world.DebugDraw();

                    // Up ray
                    const playerPosition = this.playerBody.GetPosition();
                    const upRayStart = new b2Vec2(playerPosition.x,
                        playerPosition.y - 10 / this.pixelsPerMeter);
                    const upRayEnd = new b2Vec2(playerPosition.x,
                        playerPosition.y - 30 / this.pixelsPerMeter);
                    this.world.RayCast(this.upRayCastCallback.instance, upRayStart, upRayEnd);
                    this.upRayCastCallback.drawRay(upRayStart, upRayEnd, [1, 0, 0], 3);
                    // Left down ray
                    const leftDownRayStart = new b2Vec2(playerPosition.x - 10 / this.pixelsPerMeter,
                        playerPosition.y + 10 / this.pixelsPerMeter);
                    const leftDownRayEnd = new b2Vec2(playerPosition.x - 10 / this.pixelsPerMeter,
                        playerPosition.y + 25 / this.pixelsPerMeter);
                    this.world.RayCast(this.leftDownRayCastCallback.instance, leftDownRayStart, leftDownRayEnd);
                    this.leftDownRayCastCallback.drawRay(leftDownRayStart, leftDownRayEnd, [1, 0, 0], 3);
                    // Right down ray
                    const rightDownRayStart = new b2Vec2(playerPosition.x + 10 / this.pixelsPerMeter,
                        playerPosition.y + 10 / this.pixelsPerMeter);
                    const rightDownRayEnd = new b2Vec2(playerPosition.x + 10 / this.pixelsPerMeter,
                        playerPosition.y + 25 / this.pixelsPerMeter);
                    this.world.RayCast(this.rightDownRayCastCallback.instance, rightDownRayStart, rightDownRayEnd);
                    this.rightDownRayCastCallback.drawRay(rightDownRayStart, rightDownRayEnd, [1, 0, 0], 3);

                    if (this.isLeftGroundRay || this.isRightGroundRay) {
                        this.isGround = true;
                    } else {
                        this.isGround = false;
                    }
                    console.log("isGround =", this.isGround);

                    this.isLeftGroundRay = false;
                    this.isRightGroundRay = false;
                }
            }

            me.game.world.addChild(new Graphics());
        }
        init();
    });
