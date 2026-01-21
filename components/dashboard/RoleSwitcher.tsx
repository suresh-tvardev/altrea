"use client";

import { Button } from '@/components/ui/button';
import { User, Heart, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRole } from '@/contexts/RoleContext';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const RoleSwitcher = () => {
  const { role, setRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  const handleRoleChange = (newRole: 'caregiver' | 'elder') => {
    if (newRole === role) return;
    
    setRole(newRole);
    
    // Navigate to appropriate home page
    if (newRole === 'elder') {
      router.push('/elder');
    } else {
      router.push('/');
    }
  };

  const roleConfig = {
    caregiver: {
      label: 'Caregiver View',
      icon: User,
      description: 'Monitor & Peace of Mind',
      color: 'text-primary',
    },
    elder: {
      label: 'Elder View',
      icon: Heart,
      description: 'Companion & Support',
      color: 'text-pink-500',
    },
  };

  const currentConfig = roleConfig[role];
  const CurrentIcon = currentConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 min-w-[160px] justify-between",
            role === 'elder' && "border-pink-500/50 bg-pink-500/5"
          )}
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className={cn("w-4 h-4", currentConfig.color)} />
            <span className="hidden sm:inline font-medium">{currentConfig.label}</span>
            <span className="sm:hidden">{role === 'caregiver' ? 'CG' : 'EL'}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => handleRoleChange('caregiver')}
          className={cn(
            "flex items-center gap-3 cursor-pointer",
            role === 'caregiver' && "bg-primary/10"
          )}
        >
          <User className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <div className="font-medium">Caregiver View</div>
            <div className="text-xs text-muted-foreground">Monitor & Peace of Mind</div>
          </div>
          {role === 'caregiver' && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange('elder')}
          className={cn(
            "flex items-center gap-3 cursor-pointer",
            role === 'elder' && "bg-pink-500/10"
          )}
        >
          <Heart className="w-5 h-5 text-pink-500" />
          <div className="flex-1">
            <div className="font-medium">Elder View</div>
            <div className="text-xs text-muted-foreground">Companion & Support</div>
          </div>
          {role === 'elder' && (
            <div className="w-2 h-2 rounded-full bg-pink-500" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
