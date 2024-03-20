/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],
	function () {
		return ({
			chat: () => {
				window.location = '/app/site/hosting/scriptlet.nl?script=3235&deploy=1&custpage_chat=true';
			},

			draw: () => {
				window.location = '/app/site/hosting/scriptlet.nl?script=3235&deploy=1&custpage_draw=true';
			}
		});
	}
);