// Dropbox Integration - Using Replit Connector
import { Dropbox } from 'dropbox';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=dropbox',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Dropbox not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client - access tokens expire
async function getDropboxClient() {
  const accessToken = await getAccessToken();
  return new Dropbox({ accessToken });
}

export interface DropboxFile {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  size?: number;
  modifiedAt?: string;
  provider: 'dropbox';
}

export async function listDropboxFiles(path: string = ''): Promise<DropboxFile[]> {
  const dbx = await getDropboxClient();
  const response = await dbx.filesListFolder({ path: path || '' });
  
  return response.result.entries.map((entry: any) => ({
    id: entry.id,
    name: entry.name,
    path: entry.path_display || entry.path_lower,
    isFolder: entry['.tag'] === 'folder',
    size: entry.size,
    modifiedAt: entry.client_modified || entry.server_modified,
    provider: 'dropbox' as const,
  }));
}

export async function downloadDropboxFile(path: string): Promise<{ data: Buffer; name: string; mimeType: string }> {
  const dbx = await getDropboxClient();
  const response = await dbx.filesDownload({ path }) as any;
  
  const name = response.result.name;
  const fileBinary = response.result.fileBinary;
  
  return {
    data: Buffer.from(fileBinary),
    name,
    mimeType: 'application/octet-stream',
  };
}

export async function uploadDropboxFile(
  path: string,
  contents: Buffer,
  fileName: string
): Promise<DropboxFile> {
  const dbx = await getDropboxClient();
  const fullPath = path ? `${path}/${fileName}` : `/${fileName}`;
  
  const response = await dbx.filesUpload({
    path: fullPath,
    contents,
    mode: { '.tag': 'add' },
    autorename: true,
  });
  
  return {
    id: response.result.id,
    name: response.result.name,
    path: response.result.path_display || response.result.path_lower || fullPath,
    isFolder: false,
    size: response.result.size,
    modifiedAt: response.result.client_modified,
    provider: 'dropbox',
  };
}

export async function createDropboxFolder(path: string, name: string): Promise<DropboxFile> {
  const dbx = await getDropboxClient();
  const fullPath = path ? `${path}/${name}` : `/${name}`;
  
  const response = await dbx.filesCreateFolderV2({ path: fullPath });
  
  return {
    id: response.result.metadata.id,
    name: response.result.metadata.name,
    path: response.result.metadata.path_display || response.result.metadata.path_lower || fullPath,
    isFolder: true,
    provider: 'dropbox',
  };
}

export async function deleteDropboxItem(path: string): Promise<void> {
  const dbx = await getDropboxClient();
  await dbx.filesDeleteV2({ path });
}

export async function getDropboxAccountInfo(): Promise<{ name: string; email: string; spaceUsed: number; spaceTotal: number }> {
  const dbx = await getDropboxClient();
  const [account, usage] = await Promise.all([
    dbx.usersGetCurrentAccount(),
    dbx.usersGetSpaceUsage(),
  ]);
  
  return {
    name: account.result.name.display_name,
    email: account.result.email,
    spaceUsed: (usage.result.used as number) || 0,
    spaceTotal: (usage.result.allocation as any)?.allocated || 0,
  };
}
