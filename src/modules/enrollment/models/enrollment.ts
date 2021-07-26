import { enrollmentAccounts } from "@/modules/enrollment/models/Accounts";
import { enrollmentAuthProviders } from "@/modules/enrollment/models/AuthProviders";
import store from "@/store";
import { Account } from "@/store/models/Account";
import { BackEndApiService } from "@/services/BackEndApiService";
import { FCM } from "@/services/FCMService";

class Enrollment {
  private store =store;

  addAccount() {

  }

  async saveDeviceForAccount(account: Account) {
    BackEndApiService.saveDeviceForAccount(account.id, account.provider.domainId, await FCM.getToken());
  }
}

export const enrollment = new Enrollment();