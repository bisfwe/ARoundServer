use strict;
use warnings;

use JSON;

my $filename = "./issuers_all_en.csv";
open(my $fh, '<', $filename)
  or die "Could not open file '$filename' $!";

my $first = 0;

my @company;
while (my $row = <$fh>) {
  next unless $first++;
  chomp $row;
  if ($row =~ /^([\s\w]+);([\w-]+);/) {
    push @company, { name => "$1", tickersymbol => "$2" };
  }
}
close $fh;

print JSON->new->utf8->encode(\@company);
