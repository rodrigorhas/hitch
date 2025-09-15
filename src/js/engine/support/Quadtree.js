/**
 * Quadtree - Estrutura de dados espacial para otimizar detecção de colisão
 */
export class Quadtree {
    constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
        this.bounds = bounds; // { x, y, width, height }
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        this.objects = [];
        this.nodes = [];
    }

    /**
     * Limpa o quadtree
     */
    clear() {
        this.objects = [];
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }
        this.nodes = [];
    }

    /**
     * Divide o quadtree em 4 sub-nós
     */
    split() {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        this.nodes[0] = new Quadtree(
            { x: x + subWidth, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.nodes[1] = new Quadtree(
            { x: x, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.nodes[2] = new Quadtree(
            { x: x, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );

        this.nodes[3] = new Quadtree(
            { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            this.level + 1
        );
    }

    /**
     * Retorna o índice do nó onde o objeto deve ser inserido
     * @param {Object} rect - { x, y, width, height }
     * @returns {number} - Índice do nó (-1 se não couber em um único nó)
     */
    getIndex(rect) {
        let index = -1;
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

        const topQuadrant = (rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint);
        const bottomQuadrant = (rect.y > horizontalMidpoint);

        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        } else if (rect.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    }

    /**
     * Insere um objeto no quadtree
     * @param {Object} obj - Objeto com propriedades de posição e tamanho
     */
    insert(obj) {
        if (this.nodes.length > 0) {
            const index = this.getIndex(obj);
            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }

        this.objects.push(obj);

        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }

            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }

    /**
     * Retorna todos os objetos que podem colidir com o objeto dado
     * @param {Object} rect - { x, y, width, height }
     * @returns {Array} - Array de objetos que podem colidir
     */
    retrieve(rect) {
        const returnObjects = [...this.objects];

        if (this.nodes.length > 0) {
            const index = this.getIndex(rect);
            if (index !== -1) {
                returnObjects.push(...this.nodes[index].retrieve(rect));
            } else {
                // Se o objeto não cabe em um único nó, verifica todos os nós
                for (let i = 0; i < this.nodes.length; i++) {
                    returnObjects.push(...this.nodes[i].retrieve(rect));
                }
            }
        }

        return returnObjects;
    }

    /**
     * Retorna todos os objetos no quadtree
     * @returns {Array}
     */
    getAllObjects() {
        let allObjects = [...this.objects];

        for (let i = 0; i < this.nodes.length; i++) {
            allObjects.push(...this.nodes[i].getAllObjects());
        }

        return allObjects;
    }

    /**
     * Retorna estatísticas do quadtree
     * @returns {Object}
     */
    getStats() {
        let stats = {
            objects: this.objects.length,
            nodes: this.nodes.length,
            level: this.level
        };

        if (this.nodes.length > 0) {
            stats.children = this.nodes.map(node => node.getStats());
        }

        return stats;
    }
}
