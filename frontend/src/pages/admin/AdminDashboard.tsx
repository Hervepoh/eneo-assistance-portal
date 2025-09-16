import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/auth-provider";
import { StatsCard, StatsCardProps } from "@/components/dashboard/StatsCard";
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, Shield, Key, Settings } from 'lucide-react';
import { DemandeCard } from '../request/DemandeCard';
import { useState } from "react";





const AdministrationDashboard = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const stats: StatsCardProps[] = [
        {
            title: 'Utilisateurs actifs',
            value: 100,
            icon: Users,
            color: 'blue',
            description: `${5} inactifs`,
            onClick: () => navigate('/admin/users')
        },
        {
            title: 'Rôles configurés',
            value: 5,
            icon: Shield,
            color: 'green',
            description: `${1} inactifs`,
            onClick: () => navigate('/admin/roles')
        },
        {
            title: 'Permissions système',
            value: 2,
            icon: Key,
            color: 'purple',
            description: 'Permissions disponibles',
            onClick: () => navigate('/admin/permissions')
        },
        {
            title: 'Attributions actives',
            value: 2,
            icon: Settings,
            color: 'orange',
            description: 'Rôles attribués',
            onClick: () => navigate('/admin/permissions')
        }
    ];


    // Données simulées pour les utilisateurs actifs
    const [activeUsers] = useState([
        { id: 1, name: 'Jean Dupont', role: 'Administrateur' },
        { id: 2, name: 'Marie Martin', role: 'Éditeur' },
        { id: 3, name: 'Pierre Leroy', role: 'Éditeur' },
        { id: 4, name: 'Sophie Lambert', role: 'Contributeur' },
        { id: 5, name: 'Thomas Bernard', role: 'Contributeur' },
        { id: 6, name: 'Camille Petit', role: 'Contributeur' },
        { id: 7, name: 'Lucas Moreau', role: 'Lecteur' },
        { id: 8, name: 'Emma Girard', role: 'Lecteur' },
        { id: 9, name: 'Hugo Fernandez', role: 'Lecteur' },
        { id: 10, name: 'Julie Roux', role: 'Lecteur' },
        { id: 11, name: 'Antoine Blanc', role: 'Modérateur' },
        { id: 12, name: 'Charlotte Lemoine', role: 'Modérateur' },
    ]);

    // Génération des statistiques de rôles basées sur les utilisateurs actifs
    const generateRoleStats = () => {
        const roleCounts = {};

        // Compter le nombre d'utilisateurs par rôle
        activeUsers.forEach(user => {
            if (roleCounts[user.role]) {
                roleCounts[user.role]++;
            } else {
                roleCounts[user.role] = 1;
            }
        });

        // Définir les permissions pour chaque rôle
        const rolePermissions = {
            'Administrateur': 'Toutes les permissions',
            'Éditeur': 'Créer, modifier, supprimer des contenus',
            'Contributeur': 'Créer et modifier des contenus',
            'Modérateur': 'Modérer les commentaires et contenus',
            'Lecteur': 'Lire les contenus seulement'
        };

        // Transformer en format désiré
        return Object.keys(roleCounts).map(role => ({
            role,
            users: roleCounts[role],
            permissions: rolePermissions[role] || 'Aucune permission définie'
        }));
    };

    const [roleStats] = useState(generateRoleStats());

    // Données simulées pour les permissions
    const [permissions] = useState([
        { id: 1, name: 'Lire articles', module: 'articles' },
        { id: 2, name: 'Écrire articles', module: 'articles' },
        { id: 3, name: 'Modifier articles', module: 'articles' },
        { id: 4, name: 'Supprimer articles', module: 'articles' },
        { id: 5, name: 'Approuver articles', module: 'articles' },
        { id: 6, name: 'Lire commentaires', module: 'commentaires' },
        { id: 7, name: 'Écrire commentaires', module: 'commentaires' },
        { id: 8, name: 'Modifier commentaires', module: 'commentaires' },
        { id: 9, name: 'Supprimer commentaires', module: 'commentaires' },
        { id: 10, name: 'Modérer commentaires', module: 'commentaires' },
        { id: 11, name: 'Voir utilisateurs', module: 'utilisateurs' },
        { id: 12, name: 'Ajouter utilisateurs', module: 'utilisateurs' },
        { id: 13, name: 'Modifier utilisateurs', module: 'utilisateurs' },
        { id: 14, name: 'Supprimer utilisateurs', module: 'utilisateurs' },
        { id: 15, name: 'Gérer rôles', module: 'utilisateurs' },
        { id: 16, name: 'Voir médias', module: 'médias' },
        { id: 17, name: 'Téléverser médias', module: 'médias' },
        { id: 18, name: 'Modifier médias', module: 'médias' },
        { id: 19, name: 'Supprimer médias', module: 'médias' },
        { id: 20, name: 'Voir statistiques', module: 'analytique' },
        { id: 21, name: 'Exporter données', module: 'analytique' },
        { id: 22, name: 'Voir paramètres', module: 'système' },
        { id: 23, name: 'Modifier paramètres', module: 'système' },
        { id: 24, name: 'Gérer extensions', module: 'système' },
    ]);

    // Génération des statistiques d'utilisation par module
    const generateModuleUsage = () => {
        const moduleCounts = {};

        // Compter le nombre de permissions par module
        permissions.forEach(permission => {
            if (moduleCounts[permission.module]) {
                moduleCounts[permission.module]++;
            } else {
                moduleCounts[permission.module] = 1;
            }
        });

        return moduleCounts;
    };

    const [moduleUsage] = useState(generateModuleUsage());

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
                <p className="text-gray-600 mt-1">Tableau de bord d'administration système</p>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(({ title, value, icon, color, onClick, description }, index) => (
                    <StatsCard key={index++}
                        title={title}
                        description={description}
                        value={value}
                        icon={icon}
                        color={color}
                        onClick={onClick}
                    // trend={{ value: 12, isPositive: true }}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Répartition par rôle */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des utilisateurs par rôle</h3>
                    <div className="space-y-3">
                        {roleStats.map((stat) => (
                            <div key={stat.role} className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-gray-900">{stat.role}</span>
                                    <div className="text-xs text-gray-500">{stat.permissions} permissions</div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-bold text-gray-900">{stat.users}</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(stat.users / activeUsers.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Utilisation des modules */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions par module</h3>
                    <div className="space-y-3">
                        {Object.entries(moduleUsage).map(([module, count]) => (
                            <div key={module} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 capitalize">{module}</span>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-bold text-gray-900">{count}</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${(count / permissions.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg transition-colors bg-blue-600 text-white  hover:bg-blue-700 "
                    >
                        <Users className="w-8 h-8" />
                        <div className="text-left">
                            <div className="font-medium">Gérer les utilisateurs</div>
                            <div className="text-sm text-gray-50">Créer, modifier, désactiver</div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/roles')}
                        className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Shield className="w-8 h-8 text-green-600" />
                        <div className="text-left">
                            <div className="font-medium text-gray-900">Configurer les rôles</div>
                            <div className="text-sm text-gray-500">Définir les permissions</div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/admin/permissions')}
                        className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Key className="w-8 h-8 text-purple-600" />
                        <div className="text-left">
                            <div className="font-medium text-gray-900">Attribuer permissions</div>
                            <div className="text-sm text-gray-500">Gérer les accès</div>
                        </div>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default AdministrationDashboard;
