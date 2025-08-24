import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, Key } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CreateApiKeyDialogProps {
  children: React.ReactNode;
}

export function CreateApiKeyDialog({ children }: CreateApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/v1/api-keys', {
        name,
      });
      return response;
    },
    onSuccess: (data) => {
      setCreatedKey(data.key);
      setKeyName('');
      queryClient.invalidateQueries({ queryKey: ['/api/v1/api-keys'] });
      toast({
        title: 'API Key Created',
        description: 'Your new API key has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create API key',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your API key',
        variant: 'destructive',
      });
      return;
    }
    createKeyMutation.mutate(keyName.trim());
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedKey(null);
    setKeyName('');
    setShowKey(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Create API Key</span>
          </DialogTitle>
          <DialogDescription>
            {createdKey 
              ? 'Your API key has been created. Copy it now as you won\'t be able to see it again.'
              : 'Create a new API key to access the ImageVault API programmatically.'
            }
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Your new API key</Label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showKey ? 'text' : 'password'}
                    value={createdKey}
                    readOnly
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <strong>Important:</strong> Store this key securely. You won't be able to see it again.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">API Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., My Website Integration"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                disabled={createKeyMutation.isPending}
              />
            </div>
          </form>
        )}

        <DialogFooter className="sm:justify-start">
          {createdKey ? (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          ) : (
            <div className="flex space-x-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createKeyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createKeyMutation.isPending || !keyName.trim()}
                className="flex-1"
              >
                {createKeyMutation.isPending ? 'Creating...' : 'Create API Key'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}