var sweetalert = require('sweetalert');
var Vue = require('vue');
Vue.use(require('vue-resource'));
Vue.use(require('vue-validator'));

var vm = new Vue({

	el: "html",

	data: {
		settings: [],

		updating: false,

		lang: {
			title: chrome.i18n.getMessage("options_title"),
			subtitle: chrome.i18n.getMessage("options_subtitle"),

			fields: {
				host: {
					label: chrome.i18n.getMessage("options_host_label"),
					placeholder: chrome.i18n.getMessage("options_host_placeholder"),
					validation: {
						url: chrome.i18n.getMessage("options_host_validation_url")
					}
				},
				username: {
					label: chrome.i18n.getMessage("options_username_label"),
					placeholder: chrome.i18n.getMessage("options_username_placeholder"),
					validation: {
						required: chrome.i18n.getMessage("options_username_validation_required")
					}
				},
				password: {
					label: chrome.i18n.getMessage("options_password_label"),
					placeholder: chrome.i18n.getMessage("options_password_placeholder"),
					validation: {
						required: chrome.i18n.getMessage("options_password_validation_required")
					}
				},
				filteruser: {
					label: chrome.i18n.getMessage("options_filter_user_label")
				}
			},
			button: {
				text: chrome.i18n.getMessage("options_button_text")
			}
		}
	},

	ready: function() {

		var defaults = {
			enabled: false,
	        host: '',
	        username: '',
	        password: '',
	        filterByUser: false
	    };

		chrome.storage.sync.get(defaults, function (settings) {
			this.settings = settings;
		}.bind(this));
	},

	validator: {
		validates: {
	    	url: function (val, condition) {
	    		var expression = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	    		return expression.exec(val) !== null;
	    	}
	    }
	},

	methods: {
		updateSettings: function (e) {
			e.preventDefault();

			this.updating = true;

	        this.$http.get(this.settings.host + '/rest/api/2/project', function (data, status, request) {

	            if (status === 200 && request.getResponseHeader('x-ausername') !== null) {

	            	this.settings.enabled = true;

					chrome.storage.sync.set(this.settings, function () {
						if (! chrome.runtime.error) {
							swal({
								title: "Updated!",
								text: chrome.i18n.getMessage("options_success_message"),
								type: "success",
								timer: 1000,
								showConfirmButton: false
							});

							return;
						}
					});
				}

				swal({
					title: "Failed!",
					text: chrome.i18n.getMessage("options_error_message"),
					type: "error",
					timer: 1000,
					showConfirmButton: false
				});

				this.updating = false;

	        }, {
	        	headers: {
	        		'Authorization': 'Basic ' + btoa(this.settings.username + ':' + this.settings.password)
	        	}
	        }).error(function (data, status, request) {

	           swal({
					title: "Failed!",
					text: chrome.i18n.getMessage("options_error_message"),
					type: "error",
					timer: 1000,
					showConfirmButton: false
				});

	           	this.updating = false;

	        }.bind(this));
		}
	}
});