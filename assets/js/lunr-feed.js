var hostname = "https://meikle.io";
var index = lunr(function () {
    this.field('title')
    this.field('content', {boost: 10})
    this.field('category')
    this.field('tags')
    this.ref('id')
});



    index.add({
      title: "Cisco Meraki Client VPN on Ubuntu 19.04",
      category: ["technology"],
      content: "\n    \n    Photo of Meraki MX84 Meraki Firewall from Cisco Meraki website\n\n\nWith my beloved, and worn, day to day laptop having to go in for repair, I had to setup a temporary laptop to work on for a few weeks.\n\nAt work we use Cisco Meraki devices in many places, including the edge of network for our various offices. Whilst their main use is to form a mesh network around our offices and server infrastructure, we also use them to enable a lightweight Client VPN solution.\n\nThe Cisco Meraki Client VPN option provides a L2TP/IPsec based VPN using either its own internal user store, an LDAP Directory, Microsoft Active Directory, or a Radius server to authenticate users.\n\nCisco Meraki provide great instructions for Windows, Mac and mobile devices, but really old instructions for Linux. Therefore, I am posting this as much to remind me the next time I need to set it up as to help others.\n\n\n\nInstall L2TP Plugins for Network Manager\n\nBy default, support for L2TP VPNs is not installed for Network Manager, so we need to install them:\n\nsudo apt-get install network-manager-l2tp\nsudo apt-get install network-manager-l2tp-gnome\n\n\n\nDisable System xl2tpd\n\nNetwork Manager spawns and manages its own instance of xl2tpd so if there is a system instance still running it will not be able to use UDP port 1701, and will instead use an ephemeral port (i.e. random high port).\n\nTo stop this from happening, we need to stop the deamon and disabling it from starting again:\n\nsudo systemctl stop xl2tpd\nsudo systemctl disable xl2tpd\n\n\nSetup Your VPN Connection\n\nNow you are ready to add your VPN connection. Having taken the steps above, we’ve Gnome Network Manager settings panel now includes the option to add L2TP VPN connections:\n\n\n\nThe main settings we need to customise to work with Cisco Meraki Client VPN are on the Identity tab.\n\n\n\nWe can give our VPN a name, set the VPN gateway, and add our user credentials (with optional NT Domain depending whether Active Directory is used as the authentication scheme).\n\nWe now need to set our IPsec and PPP settings.\n\nIPsec Settings\n\n\n\nIn the IPsec Settings we need to tick the Enable IPsec tunnel to L2TP host checkbox , expand the Advanced settings, and then add three things:\n\n\n  Pre-shared Key - adding the key provided by your network administrator\n  Phase1 Algorithm - use the following 3des-sha1-modp1024\n  Phase2 Algorithm - use the following 3des-sha1\n\n\nClick OK to set this on the connection.\n\nPPP Settings\n\n\n\nIn the PPP Settings we need to make sure PPP is the only Authentication mechanism selected.\n\nThe other defaults should be OK, however I’ve included a screenshot to confirm against above.\n\nClick OK to set this on the connection.\n\nUse Your VPN Connection\n\nThe VPN should now be available in the Gnome Settings panel:\n\n\n\nand in the main Gnome Menu for quick connect/disconnect\n\n\n",
      tags: ["technology","meraki","vpn"],
      id: 0
    });
    

    index.add({
      title: "Hello world",
      category: ["personal"],
      content: "\n    \n\n\nHello world! Please bear with me, I am just getting setup.\n",
      tags: ["personal"],
      id: 1
    });
    


var store = [{
    "title": "Cisco Meraki Client VPN on Ubuntu 19.04",
    "link": "/technology/cisco-meraki-client-vpn-on-ubuntu-1904.html",
    "image": null,
    "date": "August 2, 2019",
    "category": ["technology"],
    "excerpt": "Photo of Meraki MX84 Meraki Firewall from Cisco Meraki website With my beloved, and worn, day to day laptop having..."
},{
    "title": "Hello world",
    "link": "/personal/helloworld.html",
    "image": null,
    "date": "January 6, 2019",
    "category": ["personal"],
    "excerpt": "\n    \n\n\nHello world! Please bear with me, I am just getting setup.\n"
}]

$(document).ready(function() {
    $('#search-input').on('keyup', function () {
        var resultdiv = $('#results-container');
        if (!resultdiv.is(':visible'))
            resultdiv.show();
        var query = $(this).val();
        var result = index.search(query);
        resultdiv.empty();
        $('.show-results-count').text(result.length + ' Results');
        for (var item in result) {
            var ref = result[item].ref;
            var searchitem = '<li><a href="'+ hostname + store[ref].link+'">'+store[ref].title+'</a></li>';
            resultdiv.append(searchitem);
        }
    });
});