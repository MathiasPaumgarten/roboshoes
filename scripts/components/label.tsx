import * as React from "react";
import { overflow } from "../utils/math";

interface ILetterProps {
    letter: string;
}

interface ILetterState {
    x: number;
    y: number;
}

class Letter extends React.Component<ILetterProps, ILetterState> {

    originX: number = -1;
    originY: number = -1;
    element?: HTMLSpanElement;
    fixedWidth = false;

    constructor( props: ILetterProps ) {
        super( props );

        this.fixedWidth = props.letter === " ";
        this.state = {
            x: 0,
            y: 0,
        };
    }

    componentDidMount() {
        const box = this.element!.getBoundingClientRect();

        this.originX = box.left;
        this.originY = box.top;

        register( this );
    }

    componentWillUnmount() {
        unregister( this );
    }

    render(): JSX.Element {
        return (
            <span className={ [ "letter", this.fixedWidth ? "fixed-width" : "" ].join( " " ) }
                  ref={ element => this.element = element! }>
                { this.props.letter }
            </span>
        )
    }
}

/**
 * One unified way to update all letters. There is no need to do it seperatly. In order to avoid jank
 * we run all updates in one loop. The Letters have to register and unregister themselves.
 */
const letters: Letter[] = [];
let raf = -1;
let mouseX = -1;
let mouseY = -1;

window.addEventListener( "mousemove",  ( event: MouseEvent ) => {
    mouseX = event.pageX;
    mouseY = event.pageY;
} );

function register( letter: Letter ) {
    letters.push( letter );

    cancelAnimationFrame( raf );
    raf = requestAnimationFrame( update );
}

function unregister( letter: Letter ) {
    while ( letters.indexOf( letter ) >= 0 ) {
        letters.splice( letters.indexOf( letter ), 1 );
    }

    if ( letters.length === 0 ) {
        cancelAnimationFrame( raf );
    }
}

function update() {
    for ( let i = 0; i < letters.length; i++ ) {
        const letter = letters[ i ];
        const distanceX = mouseX - letter.originX;
        const distanceY = mouseY - letter.originY;
        const distance = Math.sqrt( distanceX * distanceX + distanceY * distanceY );

        if ( distance > 50 ) {
            letter.element!.style.transform = `translate( 0, 0 )`;
            continue;
        }

        const percent = 1 - distance / 50;
        const angle = Math.atan2( distanceY, distanceX ) / Math.PI;
        const reflect = overflow( angle + 1, -1, 1 ) * Math.PI;

        const x = Math.cos( reflect ) * distance * percent;
        const y = Math.sin( reflect ) * distance * percent;

        letter.element!.style.transform = `translate( ${ x }px, ${ y }px )`;
    }

    raf = requestAnimationFrame( update );
}

interface ILabelState {
    text: string;
}


export class Label extends React.Component<{}, ILabelState> {
    private readonly lineBreak = "ä"

    constructor( props: {} ) {
        super( props );

        this.state = {
            text:
                `Projects made from 100% organic, ${ this.lineBreak }` +
                `locally sourced, farm to table, ${ this.lineBreak }` +
                `custom, hand written code.`
        };
    }

    render(): JSX.Element {
        return (
            <div className="label">
                {
                    this.state.text.split( "" ).map( ( character: string, i: number )  => {
                        return character === this.lineBreak ? <br key={ i }/> : <Letter letter={ character } key={ i } />
                    } )
                }
            </div>
        );
    }
}