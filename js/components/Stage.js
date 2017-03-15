
import { Application, Container } from 'pixi.js';
import { select, zoom, event } from 'd3';
import { TweenMax, Power0 } from 'gsap';

const RESET_DURATION = 0.3;

const SCALE_MIN_VALUE = 0.5;
const SCALE_MAX_VALUE = 3;

const devicePixelRatio = window.devicePixelRatio;

class Stage extends Application {
    constructor(canvas, width, height) {
        console.log('Create Application :', width, height);
        super(
            width,
            height,
            {
                antialias:  true,
                resolution: devicePixelRatio,
            },
        );

        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.canvas.appendChild(this.view);

        this.createContainer();

        this.ticker.add(this.update.bind(this));

        this.zoomable = true;
    }

    createContainer() {
        this.container = new Container();

        const zoomHandler = zoom()
            .scaleExtent([SCALE_MIN_VALUE, SCALE_MAX_VALUE])
            .on('zoom', () => {
                if (!this.zoomable) {
                    return;
                }

                const
                    scale = event.transform.k,
                    x = event.transform.x,
                    y = event.transform.y;

                this.container.scale.set(scale, scale);

                this.container.position.set(
                    ((1 - scale) * (this.width / 2)) + x,
                    ((1 - scale) * (this.height / 2)) + y
                );
            });

        select(this.canvas).call(zoomHandler);

        this.stage.addChild(this.container);
    }

    update() {
        this.container.children.forEach((child) => {
            if (child.update) {
                child.update();
            }
        });
    }

    add(object) {
        this.container.addChild(object);
    }

    center() {
        this.zoomable = false;

        TweenMax.to(
            this.container.position,
            RESET_DURATION,
            {
                x:    0,
                y:    0,
                ease: Power0.easeNone,
            }
        );

        TweenMax.to(
            this.container.scale,
            RESET_DURATION,
            {
                x:    1,
                y:    1,
                ease: Power0.easeNone,
            }
        );
    }

}

export default Stage;
