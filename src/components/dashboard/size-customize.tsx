import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SizeCustomizeProps {
  width: number;
  onWidthChange: (value: number) => void;
  height: number;
  onHeightChange: (value: number) => void;
}

export function SizeCustomize({
  width,
  onWidthChange,
  height,
  onHeightChange,
}: SizeCustomizeProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="width">Width (px)</Label>
          <span className="text-sm text-muted-foreground">{width}px</span>
        </div>
        <Slider
          id="width"
          min={300}
          max={800}
          step={10}
          value={[width]}
          onValueChange={(value: number[]) => onWidthChange(value[0])}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="height">Height (px)</Label>
          <span className="text-sm text-muted-foreground">{height}px</span>
        </div>
        <Slider
          id="height"
          min={400}
          max={800}
          step={10}
          value={[height]}
          onValueChange={(value: number[]) => onHeightChange(value[0])}
        />
      </div>
    </div>
  );
} 