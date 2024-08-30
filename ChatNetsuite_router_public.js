/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],
	function () {
		// Enter the script ID here
		const scriptId = '';
		return ({
			chat: () => {
				window.location = `/app/site/hosting/scriptlet.nl?script=${scriptId}&deploy=1&custpage_chat=true`;
			},

			draw: () => {
				window.location = `/app/site/hosting/scriptlet.nl?script=${scriptId}3235&deploy=1&custpage_draw=true`;
			}
		});
	}
);