

export function index_parse(dom_str: string){
    fetch("").then(response => {
        if (!response.ok) {
          throw new Error(response.statusText)
        }
        return response.json()
      })
}