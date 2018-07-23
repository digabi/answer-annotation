BEGIN {state=0}
/^<testcase/ && $0 !~ /\/>/ {state=1}
{if (state==1 || $0 ~ /^</) {print} else {print > "/dev/stderr"}}
/\/>/ || /<\// {state=0}
