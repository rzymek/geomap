declare type Point = { x: number, y: number }
declare type XYArray = [number, number];
declare type PointObj = Point | XYArray;

declare type PredefinedDefName = "EPSG:4326" | "WGS84" | 'EPSG:4269' | 'EPSG:3857' | 'EPSG:3785' | 'GOOGLE' | 'EPSG:900913' | 'EPSG:102113'



interface Projector {
    /**
     * Performs a forward transformation.
     */
    forward<T extends PointObj>(coordinates: T): T
    /**
     * Performs an inverse transformation.
     */
    inverse<T extends PointObj>(coordinates: T): T
}

/**
 * Projects a point from one coordinate system to another.
 */
declare function proj4<T extends PointObj>(fromProjection: string | PredefinedDefName, toProjection: string | PredefinedDefName, coordinates: T): T;
/**
 * Projects a point from one coordinate system to another.
 */
declare function proj4<T extends PointObj>(fromProjection: string | PredefinedDefName, coordinates: T): T;
/**
 * Creates an object that will project from one coordinate system to another.
 */
declare function proj4(fromProjection: string | PredefinedDefName, toProjection?: string | PredefinedDefName): Projector;

// Add functions to the main function.

declare namespace proj4 {
    /**
     * Registers a projection for later use.
     * @param {string} name - The name used to retrieve the projection.
     * @param {string} definition - The proj4 projection definition string.
     */
    function defs(name: string, definition: string): void;
    /**
     * Defines multiple projections
     * @param {string[][]} definitions - An array of name, definition pair arrays.
     */
    function defs(definitions: [string, string][]): void;

    /**
     * Returns a registered projection.
     */
    function defs(name: string): string;
}

// Declare the NPM module.

declare module "proj4" {
    export = proj4
}

// export = proj4;