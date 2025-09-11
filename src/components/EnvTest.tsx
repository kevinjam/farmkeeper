'use client';

export default function EnvTest() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs mb-4">
      <p className="font-medium text-yellow-800 mb-2">Environment Variables Test:</p>
      <div className="space-y-1 text-yellow-700">
        <div>NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID: {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || 'NOT SET'}</div>
        <div>NODE_ENV: {process.env.NODE_ENV}</div>
        <div>NEXT_PUBLIC_BASE_URL: {process.env.NEXT_PUBLIC_BASE_URL}</div>
      </div>
    </div>
  );
}
