const core = require('@actions/core');
const api = require('./src/api')

/**
 * Set secrets in Github repo
 * This actions is participating in #ActionsHackathon 2020
 *
 * @param {api} api - api instance
 * @param {string} secret_name - Secret key name
 * @param {string} secret_value - Secret raw value
 * @see https://developer.github.com/v3/actions/secrets/#create-or-update-an-organization-secret
 * @see https://dev.to/devteam/announcing-the-github-actions-hackathon-on-dev-3ljn
 * @see https://dev.to/habibmanzur/placeholder-title-5e62
 */
const boostrap = async (api, secret_name, secret_value) => {

  try {
    const {key_id, key} = await api.getPublicKey()

    const data = await api.createSecret(key_id, key, secret_name, secret_value)

    if (api.isOrg()) {
      data.visibility = core.getInput('visibility')

      if (data.visibility === 'selected') {
        data.selected_repository_ids = core.getInput('selected_repository_ids')
      }
    }

    const response = await api.setSecret(data, secret_name)

    console.error(response.status, response.data)

    if (response.status >= 400) {
      core.setFailed(response.data)
    } else {
      core.setOutput('status', response.status)
      core.setOutput('data', response.data)
    }

  } catch (e) {
    core.setFailed(e.message)
    console.error(e)
  }
}


try {
  // `who-to-greet` input defined in action metadata file
  const name = core.getInput('name')
  const value = core.getInput('value')
  const repository = core.getInput('repository')
  const token = core.getInput('token')
  const org = core.getInput('org')

  const api = new api(token, repository, !!org)

  boostrap(api, name, value)

} catch (error) {
  core.setFailed(error.message)
}
