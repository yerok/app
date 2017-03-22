
import { Container, Circle } from 'pixi.js';
import { TweenMax, Power0 } from 'gsap';

import Supporters from './SupportersGroup';
import Candidate from '../components/Candidate';

import { getWidth, getHeight } from '../utils/window';

const { random } = Math;

const
    HIT_AREA_RADIUS         = 100,
    HIDE_DURATION           = 0.1,
    ACTIVATE_DURATION       = 1.5,
    MOVEMENT_DURATION       = 60;

class CandidateGroup extends Container {
    constructor(
        {
            position = { x: 0, y: 0 },
        },
        infos,
        supporters,
        texture,
        controller
    ) {
        super();

        this.position = position;
        this.initialPosition = { ...position }; // copy
        this.infos = infos;
        this.maire = infos.maire;

        this.candidate = new Candidate(texture); // TODO pass data

        this.supporters = new Supporters(supporters);
        this.supporters.rotate(); // TODO maybe not here

        this.interactive = true;
        this.hitArea = new Circle(0, 0, HIT_AREA_RADIUS);

        this.addChild(this.candidate);
        this.addChild(this.supporters);

        this.controller = controller;

        this.moveAround();

        this.on('pointerdown', this.handleClick.bind(this));
    }

    handleClick() {
        this.controller.candidateOpen(this);
    }

    activate(x, y, scale) {
        this.killMovement();

        this.visible = true;

        TweenMax.to(
            this,
            ACTIVATE_DURATION,
            {
                x,
                y,
                ease: Power0.easeNone,
            }
        );

        TweenMax.to(
            this.pivot,
            ACTIVATE_DURATION,
            {
                x:    0,
                y:    0,
                ease: Power0.easeNone,
            }
        );

        TweenMax.to(
            this,
            ACTIVATE_DURATION,
            {
                alpha: 1,
                ease:  Power0.easeNone,
            }
        );

        TweenMax.to(
            this.scale,
            ACTIVATE_DURATION,
            {
                x:    scale,
                y:    scale,
                ease: Power0.easeNone,
            }
        );
    }

    hide() {
        this.killMovement();

        TweenMax.to(
            this,
            HIDE_DURATION,
            {
                alpha:      0,
                ease:       Power0.easeNone,
                onComplete: () => {
                    // for perf : if not visible, not drawn
                    this.visible = false;
                },
            }
        );
    }

    reset() {
        TweenMax.to(
            this,
            ACTIVATE_DURATION,
            {
                alpha:      1,
                x:          this.initialPosition.x || 0,
                y:          this.initialPosition.y || 0,
                ease:       Power0.easeNone,
                onComplete: () => {
                    this.moveAround();
                    // TODO change for a fade in (?)
                    this.visible = true;
                },
            }
        );

        TweenMax.to(
            this.scale,
            ACTIVATE_DURATION,
            {
                x:    1,
                y:    1,
                ease: Power0.easeNone,
            }
        );

        this.supporters.resetPosition();
        this.supporters.rotate();
        this.candidate.resetPosition({ ACTIVATE_DURATION });
    }

    moveAround() { // TODO better waiting state
        const { x, y } = this.position;

        const
            pos1 = { x: x + (100 * random()), y: y + (100 * random()) },
            pos2 = { x: x - (100 * random()), y: y + (100 * random()) };

        const [p1, p2] = (random() > 0.5) ? [pos1, pos2] : [pos2, pos1];

        this.movement = TweenMax.to(
            this,
            MOVEMENT_DURATION,
            {
                repeat: -1,
                ease:   Power0.easeNone,
                bezier: {
                    type:      'thru',
                    curviness: 10,
                    values:    [
                        { x, y },
                        p1,
                        { x, y: y + (200 * random()) },
                        p2,
                        { x, y },
                    ],
                },
            }
        );
    }

    killMovement() {
        this.movement.kill();
    }

    buildDatavizData(selector) {
        return this.supporters.buildDatavizData(selector);
    }

    showDataviz(selector, totalDataviz, data, max) {
        this.candidate.hide(getWidth(), getHeight() * 2);
        this.supporters.showDataviz(selector, totalDataviz, data, max);
    }
}

export default CandidateGroup;
