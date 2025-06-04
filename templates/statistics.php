
<div class="wwp-statistics">
    <div class="wwp-stats-overview">
        <div class="wwp-stat-card">
            <h3><?php echo number_format($stats['total_clicks'] ?? 0); ?></h3>
            <p>إجمالي النقرات</p>
        </div>
        <div class="wwp-stat-card">
            <h3><?php echo number_format($stats['total_conversations'] ?? 0); ?></h3>
            <p>إجمالي المحادثات</p>
        </div>
    </div>
    
    <div class="wwp-card">
        <div class="wwp-card-header">
            <h3>الإحصائيات التفصيلية</h3>
        </div>
        <div class="wwp-card-body">
            <canvas id="wwp-detailed-chart" width="400" height="200"></canvas>
        </div>
    </div>
</div>
