export class System {
    queries = {}

    prepareExecution(entities) {
        entities.query(this.queries)
    }

    execute() {
    }
}
