/**
 * Sets up the parser as a function, only runnable from sandbox env
 * @param parser_str
 */

let parsers: Record<string, any> = {}

export function setup_parser(name: string,
                                   parser_str: string): void {
    // let AsyncFunction = Object.getPrototypeOf(
    //     async function () {
    //     }
    // ).constructor;
    parsers[name] = new Function(parser_str + "\nreturn load()")()
}

export async function run_parser(source: string, url: string): Promise<any> {

}
