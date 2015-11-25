# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.define "web", primary: true do |web|
    web.vm.box = "ubuntu/trusty64"

    web.vm.network "private_network", ip: "10.0.5.3"

    web.vm.hostname = "dev.wlsm.ents.io"
    web.hostsupdater.aliases = ["dev.wlsm.ents.io"]

    #web.vm.synced_folder ".", "/vagrant", disabled: true
    web.ssh.forward_agent=true

    web.vm.synced_folder "./", "/var/www/wlsm/current", type: "nfs",
      :mount_options  => ['nolock,vers=3,udp']

    web.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = 2048
      vb.cpus = 1
    end

    web.vm.provision "shell", path: "ansible/bootstrap-dev.sh"
  end

  # Jenkins
    config.vm.define :ci do |ci|
      ci.vm.box      = "ubuntu/trusty64"
      ci.vm.hostname = "jenkins.dev-xmas.ents.io"
      ci.vm.network :private_network, ip: "192.168.111.150"
      ci.ssh.forward_agent = true
      ci.vm.provider :virtualbox do |v|
        v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
        v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
        v.customize ["modifyvm", :id, "--memory", 2048]
        v.customize ["modifyvm", :id, "--cpus"  , 1]
      end
      ci.vm.provision "shell", path: "build/build-jenkins.sh", privileged: false
    end

    # Selenium hub
    config.vm.define :selenium do |selenium|
      selenium.vm.box      = "ubuntu/trusty64"
      selenium.vm.hostname = "selenium.dev-xmas.ents.io"
      selenium.vm.network :private_network, ip: "192.168.111.151"
      selenium.ssh.forward_agent = true
      selenium.vm.provider :virtualbox do |v|
        v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
        v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
        v.customize ["modifyvm", :id, "--memory", 1024]
        v.customize ["modifyvm", :id, "--cpus"  , 1]
      end
      selenium.vm.provision "shell", path: "build/build-selenium.sh", privileged: false
    end
end
