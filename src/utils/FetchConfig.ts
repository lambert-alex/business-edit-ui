/* eslint-disable no-console */

import { AxiosInstance as axios } from '@/utils/'

/**
 * Fetches config from environment and API.
 * Also identifies Business ID from initial route.
 * @returns A promise to get & set session storage keys with appropriate values.
 */
export async function FetchConfig (): Promise<any> {
  // get config from environment
  const origin = window.location.origin
  const processEnvVueAppPath: string = process.env.VUE_APP_PATH
  const processEnvBaseUrl: string = process.env.BASE_URL
  const windowLocationPathname = window.location.pathname // eg, /basePath/BC1218875/correction/
  const windowLocationOrigin = window.location.origin // eg, http://localhost:8080

  if (!origin || !processEnvVueAppPath || !processEnvBaseUrl || !windowLocationPathname || !windowLocationOrigin) {
    return Promise.reject(new Error('Missing environment variables.'))
  }

  // fetch config from API
  // eg, http://localhost:8080/basePath/config/configuration.json
  // eg, https://business-create-dev.pathfinder.gov.bc.ca/businesses/edit/config/configuration.json
  const url = `${origin}/${processEnvVueAppPath}/config/configuration.json`
  const headers = {
    'Accept': 'application/json',
    'ResponseType': 'application/json',
    'Cache-Control': 'no-cache'
  }

  const response = await axios.get(url, { headers }).catch(() => {
    return Promise.reject(new Error('Could not fetch configuration.json'))
  })

  const authWebUrl: string = response.data['AUTH_WEB_URL']
  sessionStorage.setItem('AUTH_WEB_URL', authWebUrl)
  console.info('Set Auth Web URL to: ' + authWebUrl)

  const registryHomeUrl: string = response.data['REGISTRY_HOME_URL']
  sessionStorage.setItem('REGISTRY_HOME_URL', registryHomeUrl)
  console.info('Set Registry Home URL to: ' + registryHomeUrl)

  const businessesUrl: string = response.data['BUSINESSES_URL']
  sessionStorage.setItem('BUSINESSES_URL', businessesUrl)
  console.info('Set Businesses URL to: ' + businessesUrl)

  const dashboardUrl: string = response.data['DASHBOARD_URL']
  sessionStorage.setItem('DASHBOARD_URL', dashboardUrl)
  console.info('Set Dashboard URL to: ' + dashboardUrl)

  const legalApiUrl: string = response.data['LEGAL_API_URL'] + response.data['LEGAL_API_VERSION_2'] + '/'
  // set base URL for axios calls
  axios.defaults.baseURL = legalApiUrl
  console.info('Set Legal API URL to: ' + legalApiUrl)

  const naicsUrl: string = response.data['NAICS_API_URL'] + response.data['NAICS_API_VERSION'] + '/'
  sessionStorage.setItem('NAICS_URL', naicsUrl)
  console.info('Set NAICS URL to: ' + naicsUrl)

  const registriesSearchUrl: string = response.data['REGISTRIES_SEARCH_API_URL'] +
    response.data['REGISTRIES_SEARCH_API_VERSION'] + '/'
  sessionStorage.setItem('REGISTRIES_SEARCH_API_URL', registriesSearchUrl)
  console.info('Set Registries Search API URL to: ' + registriesSearchUrl)

  const businessApiKey: string = response.data['BUSINESS_API_KEY']
  sessionStorage.setItem('BUSINESS_API_KEY', businessApiKey)
  console.info('Set Business API Key.')

  const authApiUrl: string = response.data['AUTH_API_URL'] + response.data['AUTH_API_VERSION'] + '/'
  sessionStorage.setItem('AUTH_API_URL', authApiUrl)
  console.info('Set Auth API URL to: ' + authApiUrl)

  const payApiUrl: string = response.data['PAY_API_URL'] + response.data['PAY_API_VERSION'] + '/'
  sessionStorage.setItem('PAY_API_URL', payApiUrl)
  console.info('Set Pay API URL to: ' + payApiUrl)

  // for system alert banner (sbc-common-components)
  const statusApiUrl: string = response.data['STATUS_API_URL'] + response.data['STATUS_API_VERSION']
  sessionStorage.setItem('STATUS_API_URL', statusApiUrl)
  console.info('Set Status API URL to: ' + statusApiUrl)

  const keycloakConfigPath: string = response.data['KEYCLOAK_CONFIG_PATH']
  sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)
  console.info('Set Keycloak Config Path to: ' + keycloakConfigPath)

  const siteminderLogoutUrl: string = response.data['SITEMINDER_LOGOUT_URL']
  if (siteminderLogoutUrl) {
    sessionStorage.setItem('SITEMINDER_LOGOUT_URL', siteminderLogoutUrl)
    console.info('Set Siteminder Logout Url to: ' + siteminderLogoutUrl)
  }

  const hotjarId: string = response.data['HOTJAR_ID']
  if (hotjarId) {
    (<any>window).hotjarId = hotjarId
    console.info('Set Hotjar ID.')
  }

  const addressCompleteKey: string = response.data['ADDRESS_COMPLETE_KEY']
  if (addressCompleteKey) {
    (<any>window).addressCompleteKey = addressCompleteKey
    console.info('Set Address Complete Key.')
  }

  const ldClientId: string = response.data['BUSINESS_EDIT_LD_CLIENT_ID']
  if (ldClientId) {
    (<any>window).ldClientId = ldClientId
    console.info('Set Launch Darkly Client ID.')
  }

  const sentryEnable: string = response.data['SENTRY_ENABLE'];
  (<any>window).sentryEnable = sentryEnable

  const sentryDsn: string = response.data['SENTRY_DSN']
  if (sentryDsn) {
    (<any>window).sentryDsn = sentryDsn
    console.info('Set Sentry DSN.')
  }

  // get Business ID and validate that it looks OK
  // it should be first token after Base URL in Pathname
  // FUTURE: improve Business ID validation
  const id = windowLocationPathname.replace(processEnvBaseUrl, '').split('/', 1)[0]
  const businessIdRegex = /^(BC|C|CP|FM)\d{7}$/
  if (businessIdRegex.test(id)) { // Allow corps/firms/coop
    sessionStorage.setItem('BUSINESS_ID', id)
  } else {
    return Promise.reject(new Error('Missing or invalid Business ID.'))
  }

  // set Base for Vue Router
  // eg, "/basePath/BCxxx/"
  const vueRouterBase = processEnvBaseUrl + id + '/'
  sessionStorage.setItem('VUE_ROUTER_BASE', vueRouterBase)
  console.info('Set Vue Router Base to: ' + vueRouterBase)

  // set Base URL for returning from redirects
  // eg, http://localhost:8080/basePath/BCxxx/
  const baseUrl = windowLocationOrigin + vueRouterBase
  sessionStorage.setItem('BASE_URL', baseUrl)
  console.info('Set Base URL to: ' + baseUrl)
}
