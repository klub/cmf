#!/bin/bash

# Install Ansible in the VM
if [ ! -f /usr/bin/ansible ]; then
    sudo apt-get install -y software-properties-common
    sudo apt-add-repository ppa:ansible/ansible
    sudo apt-get -y update
    sudo apt-get -y install ansible
fi

#sudo chkconfig iptables off

# Kickstart provisioning with Ansible in local

cd /vagrant
### Update Environment Vars ####
cp -f /var/www/wlsm/current/build/environments/dev/env_vars /home/vagrant/env_vars
chmod 644 /home/vagrant/env_vars
chown vagrant:vagrant /home/vagrant/env_vars

cp -f /var/www/wlsm/current/build/environments/dev/bash_profile /home/vagrant/.bash_profile
chmod 644 /home/vagrant/.bash_profile
chown vagrant:vagrant /home/vagrant/.bash_profile

. /home/vagrant/.bash_profile
env
ansible-galaxy install --role-file=ansible/galaxy-roles.txt --ignore-errors --force


if ansible-playbook -i ansible/hosts ansible/playbook-base-webserver-dev.yml -vvvv ; then
    phing -buildfile /var/www/wlsm/current/build.xml build:app -verbose -propertyfile /var/www/wlsm/current/build.vagrant.properties
fi


