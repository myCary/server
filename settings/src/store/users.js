import api from './api';

const state = {
    users: [],
    groups: [],
    minPasswordLength: 0
};

const mutations = {
    setUsers(state, users) {
        state.users = users;
    },
    setPasswordPolicyMinLength(state, length) {
        state.minPasswordLength = length!=='' ? length : 0;
    },
    initGroups(state, groups) {
        state.groups = groups;
    },
    createGroup(state, groupid) {
        try {
            state.groups.push({
                id: groupid,
                name: groupid,
                usercount: 0 // user will be added after the creation
            });
        } catch (e) {
            console.log('Can\'t create group', e);
        }
    },
    addUserGroup(state, { name, gid }) {
        // this should not be needed as it would means the user contains a group
        // the server database doesn't have.
        let group = state.groups.find(groupSearch => groupSearch.id == gid);
        if (group) {
            group.usercount++; // increase count
        }
        let groups = state.users.find(user => user.name == name).groups;
        groups.push(gid);
    },
    removeUserGroup(state, { name, gid }) {
        // this should not be needed as it would means the user contains a group
        // the server database doesn't have.
        let group = state.groups.find(groupSearch => groupSearch.id == gid);
        if (group) {
            group.usercount--; // lower count
        }
        let groups = state.users.find(user => user.name == name).groups;
        delete groups[gid];
    },
    addUserSubAdmin(state, { name, gid }) {
        let groups = state.users.find(user => user.name == name).subadmin;
        groups.push(gid);
    },
    removeUserSubAdmin(state, { name, gid }) {
        let groups = state.users.find(user => user.name == name).subadmin;
        delete groups[gid];
    },
    deleteUser(state, name) {
        let userIndex = state.users.findIndex(user => user.name == name);
        state.users.splice(userIndex, 1);
    },
    enableDisableUser(state, { name, enabled }) {
        state.users.find(user => user.name == name).isEnabled = enabled;
        state.groups.find(group => group.id == '_disabledUsers').usercount += enabled ? -1 : 1;
    },
    setUserData(state, { name, key, value }) {
        state.users.find(user => user.name == name)[key] = value;
    }
};

const getters = {
    getUsers(state) {
        return state.users;
    },
    getGroups(state) {
        return state.groups;
    },
    getPasswordPolicyMinLength(state) {
        return state.minPasswordLength;
    }
};

const actions = {
    /**
     * Get all users with full details
     * 
     * @param {Object} context
     * @param {Object} options
     * @param {int} options.offset List offset to request
     * @param {int} options.limit List number to return from offset
     * @returns {Promise}
     */
    getUsers(context, { offset, limit } = { offset: 0, limit: 25 }) {
        return api.get(OC.generateUrl('/settings/users/users?offset={offset}&limit={limit}', { offset, limit }))
            .then((response) => context.commit('setUsers', response.data))
            .catch((error) => context.commit('API_FAILURE', error));
    },

    getPasswordPolicyMinLength(context) {
        return api.get(OC.linkToOCS('apps/provisioning_api/api/v1/config/apps/password_policy/minLength', 2))
            .then((response) => context.commit('setPasswordPolicyMinLength', response.data.ocs.data.data))
            .catch((error) => context.commit('API_FAILURE', error));
    },

    /**
     * Dispatch addition or removal of users to groups
     * based on which groups he belonged and now belongs to
     * 
     * @param {Object} store
     * @param {Object} store.dispatch
     * @param {Object} store.state
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {Array} options.groupsgid Group id
     */
    setUserGroups({ dispatch, state }, { name, groups }) {
        let oldGroups = state.users.find(user => user.name == name).groups;
        console.log(oldGroups, groups);
        // intersect the removed groups for the user
        let delGroups = Object.keys(oldGroups).filter(x => !groups.includes(x));
        // intersect the new groups for the user
        let addGroups = groups.filter(x => !Object.keys(oldGroups).includes(x));
        console.log(oldGroups, groups, delGroups, addGroups);
        // change local data
        if (addGroups.length > 0) {
            addGroups.forEach((gid) => dispatch('addUserGroup', { name, gid }));
        }
        if (delGroups.length > 0) {
            delGroups.forEach((gid) => dispatch('removeUserGroup', { name, gid }));
        }
    },

    /**
     * Dispatch addition or removal of users to groups admin
     * based on which groups he managed and now manage
     * 
     * @param {Object} store
     * @param {Object} store.dispatch
     * @param {Object} store.state
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {Array} options.groupsgid Group id
     */
    setUserSubAdmins({ dispatch, state }, { name, groups }) {
        let oldGroups = state.users.find(user => user.name == name).subadmin;
        console.log(Object.keys(oldGroups), groups);
        // intersect the removed groups for the user
        let delGroups = Object.keys(oldGroups).filter(x => !groups.includes(x));
        // intersect the new groups for the user
        let addGroups = groups.filter(x => !Object.keys(oldGroups).includes(x));
        console.log(oldGroups, groups, delGroups, addGroups);
        // change local data
        if (addGroups.length > 0) {
            addGroups.forEach((gid) => dispatch('addUserSubAdmin', { name, gid }));
        }
        if (delGroups.length > 0) {
            delGroups.forEach((gid) => dispatch('removeUserSubAdmin', { name, gid }));
        }
    },

    /**
     * Add user to group
     * 
     * @param {Object} context
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {string} options.gid Group id
     * @returns {Promise}
     */
    addUserGroup(context, { name, gid }) {
        let data = new FormData();
        data.append('groupid', gid);
        return api.requireAdmin().then((response) => {
            return api.post(OC.linkToOCS(`cloud/users/${name}/groups`, 2), data)
                .then((response) => context.commit('addUserGroup', { name, gid }))
                .catch((error) => context.commit('API_FAILURE', error));
        });
    },

    /**
     * Remove user from group
     * 
     * @param {Object} context
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {string} options.gid Group id
     * @returns {Promise}
     */
    removeUserGroup(context, { name, gid }) {
        return api.requireAdmin().then((response) => {
            return api.delete(OC.linkToOCS(`cloud/users/${name}/groups`, 2), { groupid: gid })
                .then((response) => context.commit('removeUserGroup', { name, gid }))
                .catch((error) => context.commit('API_FAILURE', { name, error }));
        });
    },

    /**
     * Add user to group admin
     * 
     * @param {Object} context
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {string} options.gid Group id
     * @returns {Promise}
     */
    addUserSubAdmin(context, { name, gid }) {
        let data = new FormData();
        data.append('groupid', gid);
        return api.requireAdmin().then((response) => {
            return api.post(OC.linkToOCS(`cloud/users/${name}/subadmins`, 2), data)
                .then((response) => context.commit('addUserSubAdmin', { name, gid }))
                .catch((error) => context.commit('API_FAILURE', error));
        });
    },

    /**
     * Remove user from group admin
     * 
     * @param {Object} context
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {string} options.gid Group id
     * @returns {Promise}
     */
    removeUserSubAdmin(context, { name, gid }) {
        return api.requireAdmin().then((response) => {
            return api.delete(OC.linkToOCS(`cloud/users/${name}/subadmins`, 2), { groupid: gid })
                .then((response) => context.commit('removeUserSubAdmin', { name, gid }))
                .catch((error) => context.commit('API_FAILURE', { name, error }));
        });
    },

    /**
     * Delete a user
     * 
     * @param {Object} context
     * @param {string} name User name (id) 
     * @returns {Promise}
     */
    deleteUser(context, name) {
        context.commit('deleteUser', name);
        return api.requireAdmin().then((response) => {
            return api.delete(OC.linkToOCS(`cloud/users/${name}`, 2))
                .then((response) => context.commit('deleteUser', name))
                .catch((error) => context.commit('API_FAILURE', { name, error }));
        });
    },

    /** Enable or disable user 
     * 
     * @param {Object} context
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {boolean} options.enabled User enablement status
     * @returns {Promise}
     */
    enableDisableUser(context, { name, enabled = true }) {
        let userStatus = enabled ? 'enable' : 'disable';
        return api.requireAdmin().then((response) => {
            return api.put(OC.linkToOCS(`cloud/users/${name}/${userStatus}`, 2))
                .then((response) => context.commit('enableDisableUser', { name, enabled }))
                .catch((error) => context.commit('API_FAILURE', { name, error }));
        });
    },

    /**
     * Edit user data
     * 
     * @param {Object} context 
     * @param {Object} options
     * @param {string} options.name User name (id)
     * @param {string} options.key User field to edit
     * @param {string} options.value Value of the change
     * @returns {Promise}
     */
    setUserData(context, { name, key, value }) {
        if (['email', 'quota', 'displayname', 'password'].indexOf(key) >= 0) {
            if (typeof value === 'string' && value.length > 0) {
                return api.requireAdmin().then((response) => {
                    return api.put(OC.linkToOCS(`cloud/users/${name}`, 2), { key: key, value: value })
                        .then((response) => context.commit('setUserData', { name, key, value }))
                        .catch((error) => context.commit('API_FAILURE', { name, error }));
                });
            }
        }
        return Promise.reject(new Error('Invalid request data'));
    }
};

export default { state, mutations, getters, actions };