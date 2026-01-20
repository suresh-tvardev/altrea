import { cn } from '@/lib/utils';
import type { MusicRecommendation } from '@/types/eeg';
import { Music, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MusicRecommendationsProps {
  music: MusicRecommendation[];
}

export const MusicRecommendations = ({ music }: MusicRecommendationsProps) => {
  const { toast } = useToast();

  const handlePlay = (song: MusicRecommendation) => {
    toast({
      title: `Playing ${song.title}`,
      description: `by ${song.artist}`,
    });
    // In a real app, this would start playing the song
  };

  if (music.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Music for You</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Calming songs based on your current emotional state
      </p>

      <div className="space-y-2">
        {music.map((song, index) => (
          <div
            key={song.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-all group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap",
                  song.tagColor,
                  "text-white"
                )}>
                  {song.emotionalTag}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => handlePlay(song)}
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
