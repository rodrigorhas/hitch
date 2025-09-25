import { System } from "../../engine/ecs/System.js";
import { SpatialPartitionSystem } from "./SpatialPartitionSystem.js";

/**
 * Sistema de debug para visualizar o quadtree
 * Desenha os quads e entidades do quadtree para debug
 */
export class QuadtreeDebugSystem extends System {
    useFixedUpdate = false; // Debug roda em taxa de renderização
    
    queries = {
        // Não precisa de queries específicas para debug
    }

    constructor() {
        super();
        this.showQuadtree = false;
        this.showObjects = true;
        this.showStats = false;
    }

    execute(game) {
        // Não faz nada se o debug não estiver ativo
        if (!this.showQuadtree) return;

        const canvas = game.canvas;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // Salva o estado do contexto
        ctx.save();
        
        // Desenha o quadtree
        this.drawQuadtree(ctx, game);
        
        // Desenha estatísticas se solicitado
        if (this.showStats) {
            this.drawStats(ctx, game);
        }
        
        // Restaura o estado do contexto
        ctx.restore();
    }

    drawQuadtree(ctx, game) {
        // Busca o SpatialPartitionSystem para acessar o quadtree
        const spatialPartition = this.getSpatialPartitionSystem(game);
        if (!spatialPartition) return;

        // Desenha o quadtree
        spatialPartition.debugDrawQuadtree(ctx, this.showObjects);
    }

    drawStats(ctx, game) {
        const spatialPartition = this.getSpatialPartitionSystem(game);
        if (!spatialPartition) return;

        const stats = spatialPartition.getQuadtreeStats();
        const debugInfo = spatialPartition.getDebugInfo();
        
        // Configuração do texto
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        
        // Posição do texto (canto superior esquerdo)
        let y = 20;
        const lineHeight = 16;
        
        // Estatísticas do quadtree
        ctx.fillText(`Quadtree Stats:`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Total Objects: ${stats.totalObjects}`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Max Depth: ${stats.maxDepth}`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Node Count: ${stats.nodeCount}`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Objects/Node: ${stats.objectsPerNode.toFixed(2)}`, 10, y);
        y += lineHeight;
        
        // Informações de debug
        ctx.fillText(`Debug Info:`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Root Level: ${debugInfo.level}`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Root Objects: ${debugInfo.objectCount}`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Is Leaf: ${debugInfo.isLeaf}`, 10, y);
        y += lineHeight;
        ctx.fillText(`  Children: ${debugInfo.children && debugInfo.children.length}`, 10, y);
    }

    getSpatialPartitionSystem(game) {
        return game.ecs.systems.get(SpatialPartitionSystem);
    }

    /**
     * Alterna a visualização do quadtree
     */
    toggleQuadtree() {
        this.showQuadtree = !this.showQuadtree;
        console.log(`Quadtree debug: ${this.showQuadtree ? 'ON' : 'OFF'}`);
    }

    /**
     * Alterna a visualização dos objetos
     */
    toggleObjects() {
        this.showObjects = !this.showObjects;
        console.log(`Show objects: ${this.showObjects ? 'ON' : 'OFF'}`);
    }

    /**
     * Alterna a visualização das estatísticas
     */
    toggleStats() {
        this.showStats = !this.showStats;
        console.log(`Show stats: ${this.showStats ? 'ON' : 'OFF'}`);
    }

    /**
     * Retorna informações detalhadas do quadtree
     */
    getDetailedInfo(game) {
        const spatialPartition = this.getSpatialPartitionSystem(game);

        return {
            stats: spatialPartition.getQuadtreeStats(),
            debugInfo: spatialPartition.getDebugInfo(),
            settings: {
                showQuadtree: this.showQuadtree,
                showObjects: this.showObjects,
                showStats: this.showStats
            }
        };
    }

    /**
     * Força a atualização do quadtree (útil para debug)
     */
    forceUpdate(game) {
        const spatialPartition = this.getSpatialPartitionSystem(game);
        
        spatialPartition.forceFullUpdate();
        console.log('Quadtree force updated');
    }
}
