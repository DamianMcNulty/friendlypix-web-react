/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 */
// @flow

import { canUseDOM } from 'exenv';

/**
 * Set of Firebase tools.
 *
 * @param {Object} firebaseApp - The Firebae instance that will be used.
 * @return {{authReadyPromise: Promise, copyIdTokenToCookie: (function(*=))}} - The set of tools.
 */
export default function(firebaseApp) {

  // Auth state promise resolver.
  let authReadyPromiseResolver;
  const authReadyPromise = new Promise(resolve => {
    authReadyPromiseResolver = resolve
  });

  const unsubscribe = firebaseApp.auth().onAuthStateChanged(() => {
    authReadyPromiseResolver();
    unsubscribe();
  });

  // Start keeping the ID token in the __session cookie.
  const copyIdTokenToCookie = (cookieName) => {
    if (canUseDOM) {
      // Make sure the Firebase ID Token is always passed as a cookie.
      firebaseApp.auth().onIdTokenChanged(user => {
        if (user) {
          user.getIdToken().then(idToken => {
            console.log('User signed-in! ID Token:', idToken);
            document.cookie = cookieName + '=' + idToken + ';max-age=' + (idToken ? 3600 : 0);
          });
        } else {
          console.log('User signed-out!');
          document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }
      });
    }
  };

  return {
    authReadyPromise : authReadyPromise,
    copyIdTokenToCookie: copyIdTokenToCookie
  };
};