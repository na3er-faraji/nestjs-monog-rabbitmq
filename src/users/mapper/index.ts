import { UserOutputDto } from '../dto/user-output.dto';
import { UserDocument } from '../model/users.schema';

export const mapToUserOutputDto = (user: UserDocument): UserOutputDto => ({
  _id: user._id.toString(),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
});
