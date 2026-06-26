type PlayerMode = 'off' | 'mini' | 'full';

interface Window {
  YT?: {
    Player: new (elementId: string, options: Record<string, unknown>) => YTPlayer;
    PlayerState: {
      PLAYING: number;
    };
  };
  onYouTubeIframeAPIReady?: () => void;
}

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};
