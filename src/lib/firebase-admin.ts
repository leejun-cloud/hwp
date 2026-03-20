import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount = process.env.FIREBASE_ADMIN_SDK
  ? (() => {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_ADMIN_SDK)
        if (parsed.private_key) {
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
        }
        return parsed as ServiceAccount
      } catch (e) {
        console.error('❌ [Firebase Admin] FIREBASE_ADMIN_SDK 파싱 실패:', e)
        return undefined
      }
    })()
  : undefined

if (!serviceAccount) {
  console.error('❌ [Firebase Admin] FIREBASE_ADMIN_SDK 환경변수가 없습니다. 결제 기능이 동작하지 않습니다.')
}

const options: Record<string, unknown> = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

if (serviceAccount) {
  options.credential = cert(serviceAccount)
}

const adminApp = getApps().length === 0 ? initializeApp(options) : getApps()[0]

export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)

adminDb.settings({ preferRest: true, ignoreUndefinedProperties: true })

export const isAdminInitialized = !!serviceAccount
