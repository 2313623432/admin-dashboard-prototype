import { Link, useLocation } from 'react-router';
import { Home, Users, Sparkles } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI帖子管理</span>
          </Link>

          {/* 导航链接 */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">帖子管理</span>
            </Link>
            <Link
              to="/characters"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/characters')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">角色库</span>
            </Link>
            <Link
              to="/generate"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/generate')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">生成配置</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
