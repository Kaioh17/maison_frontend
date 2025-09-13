import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/tenant_provider.dart';
import '../widgets/theme_toggle_button.dart';

class TenantDashboardScreen extends StatefulWidget {
  const TenantDashboardScreen({super.key});

  @override
  State<TenantDashboardScreen> createState() => _TenantDashboardScreenState();
}

class _TenantDashboardScreenState extends State<TenantDashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Load dashboard data when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TenantProvider>().loadDashboard();
    });
  }

  Future<void> _handleLogout() async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.logout();
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          const ThemeToggleButton(),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Consumer<TenantProvider>(
        builder: (context, tenantProvider, child) {
          if (tenantProvider.isLoading && tenantProvider.dashboardData == null) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (tenantProvider.error != null && tenantProvider.dashboardData == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Theme.of(context).colorScheme.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error loading dashboard',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    tenantProvider.error!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => tenantProvider.loadDashboard(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final dashboardData = tenantProvider.dashboardData ?? {};
          final user = context.watch<AuthProvider>().user;

          return RefreshIndicator(
            onRefresh: () => tenantProvider.loadDashboard(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome Section
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome back!',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            user?.companyName ?? 'Tenant',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user?.email ?? '',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Dashboard Content
                  Text(
                    'Dashboard Overview',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  
                  // Stats Grid
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.5,
                    ),
                    itemCount: 4,
                    itemBuilder: (context, index) {
                      final stats = [
                        {
                          'title': 'Total Vehicles',
                          'value': dashboardData['total_vehicles']?.toString() ?? '0',
                          'icon': Icons.directions_car,
                          'color': Theme.of(context).colorScheme.primary,
                        },
                        {
                          'title': 'Active Bookings',
                          'value': dashboardData['active_bookings']?.toString() ?? '0',
                          'icon': Icons.book_online,
                          'color': Theme.of(context).colorScheme.tertiary,
                        },
                        {
                          'title': 'Drivers',
                          'value': dashboardData['total_drivers']?.toString() ?? '0',
                          'icon': Icons.person,
                          'color': Theme.of(context).colorScheme.secondary,
                        },
                        {
                          'title': 'Revenue',
                          'value': '\$${dashboardData['revenue']?.toString() ?? '0'}',
                          'icon': Icons.attach_money,
                          'color': Colors.green,
                        },
                      ];
                      
                      final stat = stats[index];
                      return _buildStatCard(
                        context,
                        stat['title'] as String,
                        stat['value'] as String,
                        stat['icon'] as IconData,
                        stat['color'] as Color,
                      );
                    },
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Recent Activity
                  Text(
                    'Recent Activity',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          ListTile(
                            leading: const Icon(Icons.info_outline),
                            title: const Text('Dashboard loaded successfully'),
                            subtitle: Text(
                              'Last updated: ${DateTime.now().toString().substring(0, 19)}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                          if (dashboardData.isEmpty)
                            const ListTile(
                              leading: Icon(Icons.warning_outlined),
                              title: Text('No data available'),
                              subtitle: Text('Dashboard data will appear here once available'),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 32,
              color: color,
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
