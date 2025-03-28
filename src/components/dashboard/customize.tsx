import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface CustomizeProps {
  primaryColor: string;
  onPrimaryColorChange: (value: string) => void;
  bubbleMessage: string;
  onBubbleMessageChange: (value: string) => void;
  isDarkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  width: number;
  onWidthChange: (value: number) => void;
  height: number;
  onHeightChange: (value: number) => void;
}

export function Customize({
  primaryColor,
  onPrimaryColorChange,
  bubbleMessage,
  onBubbleMessageChange,
  isDarkMode,
  onDarkModeChange,
  width,
  onWidthChange,
  height,
  onHeightChange,
}: CustomizeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize</CardTitle>
        <CardDescription>
          Customize the appearance and behavior of your chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              className="h-10 w-full"
            />
          </div>
          

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
        </div>
      </CardContent>
    </Card>
  );
} 