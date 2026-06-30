import { IsEmail, IsString, MinLength, IsOptional, IsIn, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export const TEMP_EMAIL_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "throwawaymail.com", "sharklasers.com", "grr.la",
  "mail.tm", "temp-mail.org", "fakeinbox.com", "mailnator.com",
  "dispostable.com", "getnada.com", "trashmail.com", "tempemail.net",
  "tempinbox.com", "maildrop.cc", "spamgourmet.com", "mytemp.email",
  "burnermail.io", "tempail.com", "eyepaste.com", "mailmetrash.com",
  "thankyou2010.com", "mailcatch.com", "spambox.us", "sneakemail.com",
  "spam.la", "spam.su", "mailexpire.com", "harakirimail.com",
  "inboxbear.com", "inboxalias.com", "mintemail.com", "moakt.com",
  "spamobox.com", "spamspot.com", "temporarymail.org", "temp-mailbox.com",
  "tempmailo.com", "tempmail.net", "tempmail.xyz", "tmpemails.com",
  "tmpmail.net", "trash2009.com", "trashdevil.com", "trashymail.com",
  "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "wh4f.org",
  "whyspam.me", "willselfdestruct.com", "winemaven.info", "wronghead.com",
  "wuzup.net", "xagloo.com", "xemaps.com", "xents.com", "xmaily.com",
  "xoxy.net", "yep.it", "yogamaven.com", "yopmail.fr", "yopmail.net",
  "ypmail.webarnak.fr.eu.org", "yuurok.com", "zehnminutenmail.de",
  "zippymail.info", "zoaxe.com", "zoemail.org", "zomg.info",
  "nomail.xl.cx", "nospam.ze.tc", "nowmymail.com", "nwldx.com",
  "oneoffemail.com", "oneoffmail.com", "oopi.org", "outlawspam.com",
  "ovpn.to", "pfui.ru", "pookmail.com", "privacy.net", "proxymail.eu",
  "punkass.com", "put2.net", "quickinbox.com", "rcpt.at", "recode.me",
  "recursor.net", "regbypass.com", "regbypass.com", "rejectmail.com",
  "rhyta.com", "rocketmail.com", "rollindo.net", "s0ny.net", "safe-mail.net",
  "sale.craigslist.org", "saynotospams.com", "selfdestructingmail.com",
  "sendspamhere.com", "sibmail.com", "sinnlos-mail.de", "slaskpost.se",
  "slopsbox.com", "smellfear.com", "snakemail.com", "sneakemail.com",
  "sofimail.com", "sofort-mail.de", "spam4.me", "spamail.de", "spamarrest.com",
  "spambeach.com", "spamcannon.com", "spamcannon.net", "spamcero.com",
  "spamcon.org", "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net",
  "spamcowboy.org", "spamday.com", "spamdecoy.net", "spameater.com",
  "spameater.org", "spamex.com", "spamfree24.com", "spamfree24.de",
  "spamfree24.eu", "spamfree24.info", "spamfree24.net", "spamfree24.org",
  "spamgoes.com", "spamgourmet.com", "spamherelots.com", "spamhereplease.com",
  "spamhole.com", "spamify.com", "spaminator.de", "spamkill.info",
  "spaml.com", "spamlot.net", "spammedic.com", "spammehere.com",
  "spammehere.net", "spammy.org", "spamobox.com", "spamoff.de",
  "spamout.net", "spamover.com", "spamspy.com", "spamstack.net",
  "spamthis.co.uk", "spamthisplease.com", "spamtrail.com", "spamtrap.org",
  "spamwc.de", "spamwc.eu", "spamwc.info", "spamwc.net", "spamwc.org",
  "speed.1s.fr", "spoofmail.de", "stuffmail.de", "supergreatmail.com",
  "supermailer.jp", "surfmail.tk", "teewars.org", "teleworm.com",
  "teleworm.us", "temp-mail.com", "temp-mail.de", "temp-mail.org",
  "temp-mailbox.com", "tempalias.com", "tempemail.co", "tempemail.com",
  "tempemail.net", "tempinbox.co.uk", "tempinbox.com", "tempmail.co",
  "tempmail.de", "tempmail.eu", "tempmail.it", "tempmail.net",
  "tempmail.xyz", "tempmail5.com", "tempmailer.com", "tempmailo.com",
  "temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com",
  "temporaryinbox.com", "temporarymail.org", "thankyou2010.com",
  "thisisnotmyrealemail.com", "throwamail.com", "throwaway.email",
  "throwaway.xyz", "throwawaymail.com", "throwawaymail.pp.ua",
  "trash2009.com", "trashdevil.com", "trashmail.at", "trashmail.com",
  "trashmail.de", "trashmail.me", "trashmail.net", "trashmail.org",
  "trashmail.ws", "trashymail.com", "trbvm.com", "trialmail.de",
  "trillianpro.com", "turual.com", "tyldd.com", "uggsrock.com",
  "umail.net", "upliftnow.com", "uplipht.com", "venompen.com",
  "veryrealemail.com", "viditag.com", "viewcastmedia.com", "viewcastmedia.net",
  "viewcastmedia.org", "viralemail.com", "vomoto.com", "vpn.st",
  "vsimcard.com", "vubby.com", "walala.org", "walkmail.net", "walkmail.ru",
  "wasteland.rfc822.org", "webemail.me", "webm4il.info", "weg-werf-mail.de",
  "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "wh4f.org",
  "whyspam.me", "wilemail.com", "willhackforfood.com", "willselfdestruct.com",
  "winemaven.info", "wronghead.com", "wuzup.net", "xagloo.com",
  "xemaps.com", "xents.com", "xmaily.com", "xoxy.net", "yep.it",
  "yogamaven.com", "yopmail.fr", "yopmail.net",
  "ypmail.webarnak.fr.eu.org", "yuurok.com", "zehnminutenmail.de",
  "zippymail.info", "zoaxe.com", "zoemail.org", "zomg.info",
];

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional({ enum: ["full", "course_only"], default: "full" })
  @IsOptional()
  @IsIn(["full", "course_only"])
  accountType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  targetExamId?: string;
}