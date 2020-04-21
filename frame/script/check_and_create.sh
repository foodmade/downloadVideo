#!/bin/bash

ssh_host=$1
filePath=$2

if ssh root@$ssh_host test -e $filePath;
    then echo $filePathexists 1
    else echo $filePathdoes 0
fi
