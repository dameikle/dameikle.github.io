var hostname = "https://meikle.io";
var index = lunr(function () {
    this.field('title')
    this.field('content', {boost: 10})
    this.field('category')
    this.field('tags')
    this.ref('id')
});



    index.add({
      title: "Apache Tika and the ObjectRecognitionParser (TensorFlow REST)",
      category: ["technology","opensource"],
      content: "\n    \n\nPhoto by John Schnobrich on Unsplash\n\nOne of the coolest new features added to Apache Tika in the past few years has been the addition of Parsers that leverage Deep Learning to perform object recognition and captioning.\n\nContributed by Chris Mattmann and Thejan Wijesinghe, through their work with USC Data Science, you can configure Apache Tika to call of to predefined models and get deep learning equivalent of ‘Hello World’ - tagging dog or cat pictures!\n\nSo let’s try it out.\n\n\n\nApache Tika and the ObjectRecognitionParser\n\nWhat is the ObjectRecognitionParser?\n\nThe ObjectRecognitionParser is a Parser that can be configured to recognise objects within content and annotate the metadata with information on the objects it has recognised.\n\nInternally, the recognised objects are returned in a RecognisedObject for generic objects or it’s CaptionObject sub-class for captioning:\n\n\n  RecognisedObject instances contain an ID, Label, Label Language and Confidence Score.\n  CaptionObject instances contain an ID, Caption Sentence, Caption Language and Confidence Score.\n\n\nBoth types are placed in the metadata collection during parsing.\n\nThe type of recognition to be performed needs to be defined within Apache Tika’s tika-config.xml through the configuration of ObjectRecogniser instances to be used by the parser.\n\nAvailable Object Recognisers\n\nThere are a number of ObjectRecogniser implementations in Apache Tika, including offline recognisers that need Deep Learning tools installed on the local machine (e.g. DL4J or Tensorflow) as well as online recognisers that make REST call to services.\n\nFor now we are going to focus on the online recognisers, specifically ones that use Tensorflow REST APIs runnable in Docker from the USC Data Science team.\n\nThese are:\n\n\n  TensorflowRESTRecogniser - which uses a custom REST API around Tensorflow to perform recognition on images\n  TensorflowRESTVideoRecogniser - which uses a custom REST API around Tensorflow to perform recognition on videos\n  TensorflowRESTCaptioner - which uses a custom REST API around Tensorflow to perform image captioning\n\n\nThese instances us an implementation based on the paper “Show and Tell: A Neural Image Caption Generator” for captioning images, and the Inception-V4 model from Tensorflow for recognition in video and images.\n\nI’ll come back to the offline ones in another post.\n\nLet’s try it out on Tika Server\n\nGet the Docker Images\n\nTo make it easier to get up and running we’ll use Apache Tika Docker and the helper docker-compose file.\n\nFirst, get the tika-docker project from GitHub:\n\ngit clone https://github.com/apache/tika-docker\n\nIn here is a file called docker-compose-tika-vision.yml which contains everything you need.\n\nTo make it easier we’ll create a symlink to allow us to execute docker-compose without specifying the file each time:\n\nln -s docker-compose-tika-vision.yml docker-compose.yml\n\nConfigure our instance\n\nLike most things is Apache Tika, the ObjectRecogniser can be configured using the tika-config.xml file format.\n\nTo make things easier, there are three sample configuration to choose from to get your started:\n\n\n  sample-configs/inception-rest.xml - for image recognition\n  sample-configs/inception-rest-caption.xml - for image captioning\n  sample-configs/inception-rest-video.xml - for video recognition\n\n\nYou can do this by leaving only the configuration file entry you wish to use uncommented (or present) in the volumes section of the docker-compose file.\n\nFor example, to use image captioning you can leave the following set:\n\nvolumes:\n - ./sample-configs/inception-rest-caption.xml:/tika-config.xml\n\nRun Tika Server + Inception Services\n\nWith the above configuration set in the docker-compose.yml file, you can now load up the containers:\n\ndocker-compose up\n\nApache Tika Server will keep trying to reload until it can detect the configured Inception Service instance. If so want to avoid this, you can start the Inception Service first and then Tika.\n\nOnce they are loaded, you can now send some files to it:\n\nwget https://upload.wikimedia.org/wikipedia/commons/f/f6/Working_Dogs%2C_Handlers_Share_Special_Bond_DVIDS124942.jpg -O test.jpg\ncurl -T test.jpg htp://localhost:9998/meta\n\nThis should then give you suggested captions as part of the metadata collection parsed:\n\n\"org.apache.tika.parser.recognition.object.rec.impl\",\"org.apache.tika.parser.captioning.tf.TensorflowRESTCaptioner\"\n\"X-Parsed-By\",\"org.apache.tika.parser.CompositeParser\",\"org.apache.tika.parser.recognition.ObjectRecognitionParser\"\n\"language\",\"en\"\n\"CAPTION\",\"a man standing next to a dog on a leash . (0.00022)\",\"a man standing next to a dog on a bench . (0.00017)\",\"a man and a dog sitting on a bench . (0.00011)\",\"a man standing next to a dog in a park . (0.00007)\",\"a man and a dog sitting on a bench (0.00006)\"\n\"Content-Type\",\"image/jpeg\"\n\nHow about the Tika App?\nYou can also re-use the Inception Services from the docker-compose.yml file for the Apache Tika app interactively.\n\nTo do the captioning, you can just start the inception service you want - in this case inception-caption:\n\ndocker-compose up inception-caption \n\nYou can then create a custom tika-config.xml and setting the appropriate apiBaseUri\n\nEOT &gt;&gt; tika-config.xml\n&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;\n&lt;properties&gt;\n    &lt;parsers&gt;\n        &lt;parser class=\"org.apache.tika.parser.recognition.ObjectRecognitionParser\"&gt;\n            &lt;mime&gt;image/jpeg&lt;/mime&gt;\n            &lt;mime&gt;image/png&lt;/mime&gt;\n            &lt;mime&gt;image/gif&lt;/mime&gt;\n            &lt;params&gt;\n                &lt;param name=\"apiBaseUri\" type=\"uri\"&gt;http://localhost:8765/inception/v3&lt;/param&gt;\n                &lt;param name=\"captions\" type=\"int\"&gt;5&lt;/param&gt;\n                &lt;param name=\"maxCaptionLength\" type=\"int\"&gt;15&lt;/param&gt;\n                &lt;param name=\"class\" type=\"string\"&gt;org.apache.tika.parser.captioning.tf.TensorflowRESTCaptioner&lt;/param&gt;\n            &lt;/params&gt;\n        &lt;/parser&gt;\n    &lt;/parsers&gt;\n&lt;/properties&gt;\nEOT\n\nIt’s worth noting in the sample configuration the apiBaseUri uses the Docker Compose service name and internal port. For running outside, you’ll need to use the external facing port mapping and IP/Hostname of the machine it is running on.\n\nThen you can run the Apache Tika App JAR using your custom configuration. For example, to launch it in GUI mode you could use:\n\njava -jar tika-app-1.25.jar --config=tika-config.xml -g\n\nWhat’s next?\nThese REST based Tensorflow models are great examples of how Deep Learning can be used to augment the logic approach of Apache Tika for content parsing or detection.\n\nIf you want to try adding basic tagging or captioning to your search or asset pipelines, these models could provide a start, or the REST API implementation provide inspiration for hosting your own Tensorflow models.\n\nIt is an area that will continue to expand in the project and provides another API extension point where you can build your own ObjectRecogniser implementations. Happy Parsing!\n",
      tags: ["apache","tika","tensorflow"],
      id: 0
    });
    

    index.add({
      title: "HP Probook Touchpad Slow After Supend Ubuntu 19.04",
      category: ["technology"],
      content: "\n    \n    Photo of a Laptop Touchpad\n\n\nHaving got used to my replacement laptop, I’ve decided to keep using it, but there was one thing annoying me - the trackpad!\n\nThe trackpad is definately not the same quality as the MacBook Pro I was used to, but I could cope as the main features are there. However, I often move around a lot going from meeting to meeting, making use of the sleep/suspend capability.\n\nThat was when the trouble started…\n\n\n\nSluggish Touch\n\nUpon waking from suspend, the touchpad was sluggish and jumping all over the place, rendering the machine unusable without a mouse!\n\nThe best way it seemed to get the touchpad to behave was to add post suspend script using systemd to reload the driver. A little hacky but effective!\n\nSystemd and Suspend/Hibernation Hooks\n\nIt is really easy to perform an action either before or after you suspend, with systemd providing a nice script based hook within its systemd-suspend.service system service.\n\nTo use this, all you need to do is put an executable script under /usr/lib/systemd/system-sleep/ that checks whether the first argument is ‘pre’ for before the system suspends, or ‘post’ for after the system wakes. The script can have any name.\n\nYou can see more information in it’s man page:\n\nman systemd-suspend.service\n\nThe Script\n\nTo sort this once and for all on the HP ProBook I wrote the following into a file called /lib/systemd/system-sleep/touchpad-reload:\n\n#!/bin/sh\ncase $1 in\n  post)\n    /sbin/rmmod i2c_hid &amp;&amp; /sbin/modprobe i2c_hid\n  ;;\nesac\n\n\n\nAnd now the touchpad is as happy post-suspend as it is on a fresh restart. Happy days!\n",
      tags: ["technology","hp-probook","touchpad"],
      id: 1
    });
    

    index.add({
      title: "Cisco Meraki Client VPN on Ubuntu 19.04/19.10/20.04",
      category: ["technology"],
      content: "\n    \n    Photo of Meraki MX84 Meraki Firewall from Cisco Meraki website\n\n\nWith my beloved, and worn, day to day laptop having to go in for repair, I had to setup a temporary laptop to work on for a few weeks.\n\nAt work we use Cisco Meraki devices in many places, including the edge of network for our various offices. Whilst their main use is to form a mesh network around our offices and server infrastructure, we also use them to enable a lightweight Client VPN solution.\n\nThe Cisco Meraki Client VPN option provides a L2TP/IPsec based VPN using either its own internal user store, an LDAP Directory, Microsoft Active Directory, or a Radius server to authenticate users.\n\nCisco Meraki provide great instructions for Windows, Mac and mobile devices, but really old instructions for Linux. Therefore, I am posting this as much to remind me the next time I need to set it up as to help others.\n\n\n\nInstall L2TP Plugins for Network Manager\n\nBy default, support for L2TP VPNs is not installed for Network Manager, so we need to install them:\n\nsudo apt-get install network-manager-l2tp\nsudo apt-get install network-manager-l2tp-gnome\n\n\n\nDisable System xl2tpd\n\nNetwork Manager spawns and manages its own instance of xl2tpd so if there is a system instance still running it will not be able to use UDP port 1701, and will instead use an ephemeral port (i.e. random high port).\n\nTo stop this from happening, we need to stop the deamon and disabling it from starting again:\n\nsudo systemctl stop xl2tpd\nsudo systemctl disable xl2tpd\n\n\nSetup Your VPN Connection\n\nNow you are ready to add your VPN connection. Having taken the steps above, we’ve Gnome Network Manager settings panel now includes the option to add L2TP VPN connections:\n\n\n\nThe main settings we need to customise to work with Cisco Meraki Client VPN are on the Identity tab.\n\n\n\nWe can give our VPN a name, set the VPN gateway, and add our user credentials (with optional NT Domain depending whether Active Directory is used as the authentication scheme).\n\nWe now need to set our IPsec and PPP settings.\n\nIPsec Settings\n\n\n\nIn the IPsec Settings we need to tick the Enable IPsec tunnel to L2TP host checkbox , expand the Advanced settings, and then add three things:\n\n\n  Pre-shared Key - adding the key provided by your network administrator\n  Phase1 Algorithm - use the following 3des-sha1-modp1024\n  Phase2 Algorithm - use the following 3des-sha1\n\n\nClick OK to set this on the connection.\n\nPPP Settings\n\n\n\nIn the PPP Settings we need to make sure PPP is the only Authentication mechanism selected.\n\nThe other defaults should be OK, however I’ve included a screenshot to confirm against above.\n\nClick OK to set this on the connection.\n\nUse Your VPN Connection\n\nThe VPN should now be available in the Gnome Settings panel:\n\n\n\nand in the main Gnome Menu for quick connect/disconnect\n\n\n",
      tags: ["technology","meraki","vpn"],
      id: 2
    });
    

    index.add({
      title: "Hello world",
      category: ["personal"],
      content: "\n    \n\n\nHello world! Please bear with me, I am just getting setup.\n",
      tags: ["personal"],
      id: 3
    });
    


var store = [{
    "title": "Apache Tika and the ObjectRecognitionParser (TensorFlow REST)",
    "link": "/technology/opensource/apache-tika-and-objectrecognitionparser-tensorflow-rest.html",
    "image": null,
    "date": "December 1, 2020",
    "category": ["technology","opensource"],
    "excerpt": "Photo by John Schnobrich on Unsplash One of the coolest new features added to Apache Tika in the past few..."
},{
    "title": "HP Probook Touchpad Slow After Supend Ubuntu 19.04",
    "link": "/technology/hp-probook-touchpad-slow-after-suspend-ubuntu.html",
    "image": null,
    "date": "December 6, 2019",
    "category": ["technology"],
    "excerpt": "Photo of a Laptop Touchpad Having got used to my replacement laptop, I’ve decided to keep using it, but there..."
},{
    "title": "Cisco Meraki Client VPN on Ubuntu 19.04/19.10/20.04",
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